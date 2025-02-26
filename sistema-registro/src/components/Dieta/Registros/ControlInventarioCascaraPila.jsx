import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ControlInventarioCascaraPila.css";
import supabase from "../../../supabaseClient";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import * as XLSX from "xlsx";
import logo2 from "../../../assets/mosca.png";
import jsPDF from "jspdf";
import "jspdf-autotable";

function ControlInventarioCascaraPila() {
  let emptyRegister = {
    fecha: "",
    entrada_kg: "",
    salida_kg: "",
    saldo_kg: "",
    responsable: "",
    observaciones: "",
  };

  const [registros, setRegistros] = useState([]);
  const [registro, setRegistro] = useState(emptyRegister);
  const toast = useRef(null);
  const dt = useRef(null);
  const [selectedRegistros, setSelectedRegistros] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [registroDialog, setRegistroDialog] = useState(false);
  const [deleteRegistroDialog, setDeleteRegistroDialog] = useState(false);
  const [deleteRegistrosDialog, setDeleteRegistrosDialog] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    fecha: "",
    entrada_kg: "",
    salida_kg: "",
    saldo_kg: "",
    responsable: "",
    observaciones: "",
  });

  const convertirFecha = (fecha) =>
    fecha ? fecha.split("-").reverse().join("/") : "";

  const fetchRegistros = async () => {
    try {
      const { data, error } = await supabase
        .from("Control_Inventario_Cascara_Pila")
        .select();
        if (data) {
          setRegistros(data);
        }
      } catch {
        console.log("Error en la conexión a la base de datos");
      }
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  const cols = [
    { field: "fecha", header: "Fecha" },
    { field: "entrada_kg", header: "Entrada (kg)" },
    { field: "salida_kg", header: "Salida (kg)" },
    { field: "saldo_kg", header: "Saldo (kg)" },
    { field: "responsable", header: "Responsable" },
    { field: "observaciones", header: "Observaciones" },
    {field: "registrado", header: "Registrado"}
  ];

  const exportColumns = cols.map((col) => ({
        title: col.header,
        dataKey: col.field,
      }));
    
      const exportPdf = () => {
        if (selectedRegistros.length === 0) {
          toast.current.show({
            severity: "warn",
            summary: "Advertencia",
            detail: "No hay filas seleccionadas para exportar.",
            life: 3000,
          });
          return;
        }
    
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Registros de Control Inventario Cascara y P iña", 14, 22);
    
        const exportData = selectedRegistros.map(({ fec_registro, hor_registro, ...row }) => ({
          ...row,
          registrado: `${fec_registro || ""} ${hor_registro || ""}`,
        }));
    
        const columnsPerPage = 5;
        const maxHeightPerColumn = 10;
        const rowHeight = exportColumns.length * maxHeightPerColumn + 10;
        let currentY = 30;
    
        const headerColor = [41, 128, 185];
        const textColor = [0, 0, 0];
    
        for (let i = 0; i < exportData.length; i++) {
          if (currentY + rowHeight > doc.internal.pageSize.height) {
            doc.addPage();
            currentY = 30;
          }
    
          const row = exportData[i];
          const startX = 14;
    
          exportColumns.forEach(({ title, dataKey }, index) => {
            const value = row[dataKey];
            doc.setFillColor(...headerColor);
            doc.rect(startX, currentY + (index * maxHeightPerColumn), 180, maxHeightPerColumn, 'F');
            doc.setTextColor(255);
            doc.text(title, startX + 2, currentY + (index * maxHeightPerColumn) + 7);
            doc.setTextColor(...textColor);
            doc.text(`${value}`, startX + 90, currentY + (index * maxHeightPerColumn) + 7);
          });
    
          currentY += rowHeight;
        }
    
        doc.save("Control Calidad Cosecha.pdf");
      };
  
    const exportXlsx = () => {
        if (selectedRegistros.length === 0) {
          toast.current.show({
            severity: "warn",
            summary: "Advertencia",
            detail: "No hay filas seleccionadas para exportar.",
            life: 3000,
          });
          return;
        }
    
        const headers = cols.map(col => col.header);
        const exportData = selectedRegistros.map(({ fec_registro, hor_registro, ...registro }) => ({
          ...registro,
          registrado: `${fec_registro || ""} ${hor_registro || ""}`,
        }));
    
        const rows = exportData.map(registro => cols.map(col => registro[col.field]));
    
        const dataToExport = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(dataToExport);
    
        ws["!cols"] = cols.map(col => ({ width: Math.max(col.header.length, 10) }));
    
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Registros");
        XLSX.writeFile(wb, "Control Calidad Cosecha.xlsx");
      };

  

  

  const dateEditor = (options) => {
    const convertToInputFormat = (date) => {
      if (!date) return "";
      const [day, month, year] = date.split("/");
      return `${year}-${month}-${day}`;
    };
    const convertToDatabaseFormat = (date) => {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    };

    return (
      <InputText
        type="date"
        value={convertToInputFormat(options.value)}
        onChange={(e) => {
          const selectedDate = e.target.value;
          options.editorCallback(convertToDatabaseFormat(selectedDate));
        }}
      />
    );
  };
  
  const timeEditor = (options) => {
    return (
      <InputText
        type="time"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const textEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const numberEditor = (options) => {
    return (
      <InputText
        type="number"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const floatEditor = (options) => {
    return (
      <InputText
        type="float"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const allowEdit = (rowData) => {
    return rowData.name !== "Blue Band";
  };

  const onRowEditComplete = async ({ newData }) => {
    const { id, ...updatedData } = newData;
    try {
      const { error } = await supabase
        .from("Control_Inventario_Cascara_Pila")
        .update(updatedData)
        .eq("id", id);

      if (error) return console.error("Error al actualizar:", error.message);

      setRegistros((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...newData } : n))
      );
    } catch (err) {
      console.error("Error inesperado:", err);
    }
  };

  const formatDateTime = (date, format = "DD-MM-YYYY hh:mm A") => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
      .formatToParts(date)
      .reduce((acc, { type, value }) => ({ ...acc, [type]: value }), {});

    return format
      .replace("DD", fmt.day)
      .replace("MM", fmt.month)
      .replace("YYYY", fmt.year)
      .replace("hh", fmt.hour.padStart(2, "0"))
      .replace("mm", fmt.minute)
      .replace("A", fmt.dayPeriod || "AM");
  };

  const saveRegistro = async () => {
    setSubmitted(true);
    if (
      !registro.fecha ||
      !registro.entrada_kg ||
      !registro.salida_kg ||
      !registro.saldo_kg ||
      !registro.responsable
    ) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Llena todos los campos",
        life: 3000,
      });
      return;
    }
    try {
      const currentDate = formatDateTime(new Date(), "DD/MM/YYYY"); // Fecha actual
      const currentTime = formatDateTime(new Date(), "hh:mm A"); // Hora actual

      const { data, error } = await supabase
        .from("Control_Inventario_Cascara_Pila")
        .insert([{
          fecha: formatDateTime(new Date(registro.fecha), "DD/MM/YYYY"),
          entrada_kg: registro.entrada_kg,
          salida_kg: registro.salida_kg,
          saldo_kg: registro.saldo_kg,
          responsable: registro.responsable,
          observaciones: registro.observaciones,
          fec_registro: currentDate,
          hor_registro: currentTime,

        }]);
      if (error) {
        console.error("Error en Supabase:", error);
        throw new Error(
          error.message || "Error desconocido al guardar en Supabase"
        );
      }
      toast.current.show({
        severity: "success",
        summary: "Exitoso",
        detail: "Registro creado correctamente",
        life: 3000,
      });
      setRegistro(emptyRegister);
      setRegistroDialog(false);
      setSubmitted(false);
      fetchRegistros();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Ocurrió un error al crear el registro",
        life: 3000,
      });
    }
  };

  

  const onInputChange = (e, name) => {
    let val = e.target.value;
    if (e.target.type === "number") {
      val = val ? parseFloat(val) : "";
    }
    let _registro = { ...registro };
    _registro[`${name}`] = val;
    setRegistro(_registro);
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Nuevo"
          icon="pi pi-plus"
          severity="success"
          onClick={openNew}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="exportar-container flex flex-wrap gap-2">
        <Button
          label="Exportar a Excel"
          icon="pi pi-upload"
          className="p-button-help"
          onClick={exportXlsx}
        />
        <Button
          label="Exportar a PDF"
          icon="pi pi-file-pdf"
          className="p-button-danger"
          onClick={exportPdf}
        />
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <IconField iconPosition="left">
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscador Global..."
        />
      </IconField>
    </div>
  );

  const openNew = () => {
    setRegistro(emptyRegister);
    setSubmitted(false);
    setRegistroDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setRegistroDialog(false);
  };

  const registroDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        outlined
        onClick={hideDialog}
      />
      <Button label="Guardar" icon="pi pi-check" onClick={saveRegistro} />
    </React.Fragment>
  );

  const filteredRegistros = registros.filter((registro) => {
    return (
      registro.fecha.includes(filters.fecha) &&
      registro.entrada_kg.toString().includes(filters.entrada_kg) &&
      registro.salida_kg.toString().includes(filters.salida_kg) &&
      registro.saldo_kg.toString().includes(filters.saldo_kg) &&
      registro.responsable.includes(filters.responsable) &&
      registro.observaciones.includes(filters.observaciones)
    );
  });

  return (
    <>
      <div className="controlinventario-container">
        <Toast ref={toast} />
        <h1>
          <img src={logo2} alt="mosca" className="logo2" />
          Control de Inventario de Cáscara en Pila
        </h1>
        <div className="welcome-message">
          <p>
            Bienvenido al sistema de control de inventario. Aquí puedes gestionar
            los registros de cáscara en pila.
          </p>
        </div>
        <button onClick={() => navigate(-1)} className="return-button">
          Volver
        </button>
        <br />
        <br />
        <button onClick={() => navigate(-2)} className="menu-button">
          Menú principal
        </button>

        <div className="tabla-container">
          <Toolbar
            className="mb-4"
            left={leftToolbarTemplate}
            right={rightToolbarTemplate}
          ></Toolbar>
          <DataTable
            editMode="row"
            onRowEditComplete={onRowEditComplete}
            ref={dt}
            value={filteredRegistros}
            selection={selectedRegistros}
            onSelectionChange={(e) => setSelectedRegistros(e.value)}
            onRowEditInit={(e) => setRegistro(e.data)}
            className="p-datatable-gridlines tabla"
            style={{ width: "100%" }}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} Registros"
            globalFilter={globalFilter}
            header={header}
          >
            <Column selectionMode="multiple" exportable={false}></Column>
            <Column
              field="id"
              header="ID"
              sortable
              style={{ minWidth: "3rem" }}
            />
            <Column
              field="fecha"
              header="Fecha"
              editor={(options) => dateEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="entrada_kg"
              header="Entrada (kg)"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="salida_kg"
              header="Salida (kg)"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="saldo_kg"
              header="Saldo (kg)"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="responsable"
              header="Responsable"
              editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="fec_registro"
              header="Fecha Registro"
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="hor_registro"
              header="Hora Registro"
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="observaciones"
              header="Observaciones"
              editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              header="Herramientas"
              rowEditor
              headerStyle={{ width: "10%", minWidth: "5rem" }}
              bodyStyle={{ textAlign: "center" }}
            />
          </DataTable>
        </div>
      </div>
      <Dialog
        visible={registroDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Nuevo registro"
        modal
        className="p-fluid"
        footer={registroDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="fecha" className="font-bold">
            Fecha{" "}
            {submitted && !registro.fecha && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="date"
            id="fecha"
            value={registro.fecha}
            onChange={(e) => onInputChange(e, "fecha")}
            required
            autoFocus
          />
          <br />
          <label htmlFor="entrada_kg" className="font-bold">
            Entrada (kg){" "}
            {submitted && !registro.entrada_kg && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            step="0.01"
            id="entrada_kg"
            value={registro.entrada_kg}
            onChange={(e) => onInputChange(e, "entrada_kg")}
            required
          />
          <br />
          <label htmlFor="salida_kg" className="font-bold">
            Salida (kg){" "}
            {submitted && !registro.salida_kg && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            step="0.01"
            id="salida_kg"
            value={registro.salida_kg}
            onChange={(e) => onInputChange(e, "salida_kg")}
            required
          />
          <br />
          <label htmlFor="saldo_kg" className="font-bold">
            Saldo (kg){" "}
            {submitted && !registro.saldo_kg && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            step="0.01"
            id="saldo_kg"
            value={registro.saldo_kg}
            onChange={(e) => onInputChange(e, "saldo_kg")}
            required
          />
          <br />
          <label htmlFor="responsable" className="font-bold">
            Responsable{" "}
            {submitted && !registro.responsable && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="text"
            id="responsable"
            value={registro.responsable}
            onChange={(e) => onInputChange(e, "responsable")}
            required
          />
          <br />
          <label htmlFor="observaciones" className="font-bold">
            Observaciones{" "}
            {submitted && !registro.observaciones && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="text"
            id="observaciones"
            value={registro.observaciones}
            onChange={(e) => onInputChange(e, "observaciones")}
            required
          />
        </div>
      </Dialog>
    </>
  );
}

export default ControlInventarioCascaraPila;