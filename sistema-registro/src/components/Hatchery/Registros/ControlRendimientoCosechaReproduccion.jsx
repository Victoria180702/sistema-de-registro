import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ControlRendimientoCosechaReproduccion.css";
import supabase from "../../../supabaseClient";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { FaSeedling } from "react-icons/fa"; // Importar ícono
import * as XLSX from 'xlsx';
import logo2 from "../../../assets/mosca.png";
import jsPDF from "jspdf";
import "jspdf-autotable";

function ControlRendimientoCosechaReproduccion() {
  let emptyRegister = {
    num_lote: "",
    fec_siembra: "",
    fec_cosecha: "",
    peso_pp_total_kg: "",
    cant_cajas_cosechadas: "",
    frass_fino_total_kg: "",
    material_grueso_total_kg: "",
    cantidad_pp_25g: "",
    cantidad_pp_totales: "",
    peso_individual_pp_mg: "",
    cantidad_cajas: "",
    cantidad_camas_pupacion: "",
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
    num_lote: "",
    fec_siembra: "",
    fec_cosecha: "",
  });

  const fetchRegistros = async () => {
    const { data, error } = await supabase.from("Control_Rendimiento_Cosecha_Reproduccion").select();
    setRegistros(data || []);
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  const formatDateTime = (date, format = "DD-MM-YYYY hh:mm A") => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(date);
    const dateMap = parts.reduce((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});
    return format
      .replace("DD", dateMap.day)
      .replace("MM", dateMap.month)
      .replace("YYYY", dateMap.year)
      .replace("hh", dateMap.hour.padStart(2, "0"))
      .replace("mm", dateMap.minute)
      .replace("A", dateMap.dayPeriod || "AM");
  };

  const exportPdf = () => {
    const doc = new jsPDF();
  
    // Configuración del título
    doc.setFontSize(18);
    doc.text("Registros de Cosecha Eggies Invernadero - Embudos", 14, 22);
  
    // Configuración de la tabla
    doc.autoTable({
      head: [exportColumns.map(col => col.title)], // Encabezados de la tabla
      body: selectedRegistros.map(registro => exportColumns.map(col => registro[col.dataKey])), // Datos de la tabla
      startY: 30, // Posición inicial de la tabla
      styles: { fontSize: 10 }, // Estilo de la tabla
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Estilo del encabezado
    });
  
    // Guardar el PDF
    doc.save("Control_Rendimiento_Cosecha/Reproduccion.pdf");
  };

  const exportXlsx = () => {
    // Obtener los encabezados de las columnas
    const headers = cols.map((col) => col.header);  // Mapear solo los encabezados de las columnas
    
    // Obtener los datos seleccionados y mapearlos para las columnas
    const rows = selectedRegistros.map((registro) =>
      cols.map((col) => registro[col.field]) // Mapear los valores de cada fila por las columnas
    );
  
    // Agregar la fila de encabezados al principio de los datos
    const dataToExport = [headers, ...rows];
  
    // Crear una hoja de trabajo a partir de los encabezados y los datos
    const ws = XLSX.utils.aoa_to_sheet(dataToExport);
  
    // Configurar el estilo de la hoja para asegurar la correcta separación de celdas
    const wscols = cols.map(col => ({ width: Math.max(col.header.length, 10) })); // Ajustar el ancho de las columnas según los encabezados
    ws['!cols'] = wscols;
  
    // Crear un libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
  
    // Exportar el archivo .xlsx
    XLSX.writeFile(wb, "Control_Rendimiento_Cosecha_Reproduccion.xlsx");
  };
  
  
  

  const cols = [
    { field: "num_lote", header: "Número de Lote" },
    { field: "fec_siembra", header: "Fecha de Siembra" },
    { field: "fec_cosecha", header: "Fecha de Cosecha" },
    { field: "peso_pp_total_kg", header: "Peso PP Total (kg)" },
    { field: "cant_cajas_cosechadas", header: "Cajas Cosechadas" },
    { field: "frass_fino_total_kg", header: "Frass Fino Total (kg)" },
    { field: "material_grueso_total_kg", header: "Material Grueso Total (kg)" },
    { field: "cantidad_pp_25g", header: "Cantidad PP 25g" },
    { field: "cantidad_pp_totales", header: "Cantidad PP Totales" },
    { field: "peso_individual_pp_mg", header: "Peso Individual PP (mg)" },
    { field: "cantidad_cajas", header: "Cantidad de Cajas" },
    { field: "cantidad_camas_pupacion", header: "Cantidad de Camas de Pupación" },
  ];

  const exportColumns = cols.map((col) => ({
    title: col.header,
    dataKey: col.field,
  }));

  const onRowEditComplete = async (e) => {
    const { newData } = e;
    const { id } = newData;
    try {
      const { error } = await supabase
        .from("Control_Rendimiento_Cosecha_Reproduccion")
        .update(newData)
        .eq("id", id);
      if (error) {
        console.error("Error al actualizar:", error.message);
        return;
      }
      setRegistros((prevRegistros) =>
        prevRegistros.map((registro) => (registro.id === id ? { ...registro, ...newData } : registro))
      );
    } catch (err) {
      console.error("Error inesperado:", err);
    }
  };

  const dateEditor = (options) => {
    return <InputText type="date" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
  };

  const textEditor = (options) => {
    return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
  };

  const numberEditor = (options) => {
    return <InputText type="number" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
  };

  const floatEditor = (options) => {
    return <InputText type="number" step="0.01" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
  };

  const saveRegistro = async () => {
    setSubmitted(true);
    if (
      !registro.num_lote ||
      !registro.fec_siembra ||
      !registro.fec_cosecha ||
      !registro.peso_pp_total_kg ||
      !registro.cant_cajas_cosechadas ||
      !registro.frass_fino_total_kg ||
      !registro.material_grueso_total_kg ||
      !registro.cantidad_pp_25g ||
      !registro.cantidad_pp_totales ||
      !registro.peso_individual_pp_mg ||
      !registro.cantidad_cajas ||
      !registro.cantidad_camas_pupacion
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
      const { id, ...registroSinId } = registro;
      const { data, error } = await supabase
        .from("Control_Rendimiento_Cosecha_Reproduccion")
        .insert([registroSinId]);
      if (error) {
        console.error("Error en Supabase:", error);
        throw new Error(error.message || "Error desconocido al guardar en Supabase");
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
        <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
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
        <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
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
      <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-check" onClick={saveRegistro} />
    </React.Fragment>
  );

  const filteredRegistros = registros.filter((registro) => {
    return (
      registro.num_lote.toString().includes(filters.num_lote) &&
      registro.fec_siembra.includes(filters.fec_siembra) &&
      registro.fec_cosecha.includes(filters.fec_cosecha)
    );
  });

  return (
    <>
      <div className="controlrendimiento-container">
        <Toast ref={toast} />
        <h1>
          <img src={logo2} alt="mosca" className="logo2" />
          Control de Rendimiento de Cosecha y Reproducción
        </h1>
        <div className="welcome-message">
          <p>Bienvenido al sistema de control de rendimiento. Aquí puedes gestionar los registros de cosecha y reproducción.</p>
        </div>
        <button onClick={() => navigate(-1)} className="back-button">
          Volver
        </button>
        <br />
        <br />
        <button onClick={() => navigate(-2)} className="menu-button">
          Menú principal
        </button>
        
        <div className="tabla-scroll">
          <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
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
            <Column field="id" header="ID" sortable style={{ minWidth: "3rem" }} />
            <Column field="num_lote" header="Número de Lote" editor={(options) => numberEditor(options)} sortable style={{ minWidth: "10rem" }} />
            <Column field="fec_siembra" header="Fecha de Siembra" editor={(options) => dateEditor(options)} sortable style={{ minWidth: "10rem" }} />
            <Column field="fec_cosecha" header="Fecha de Cosecha" editor={(options) => dateEditor(options)} sortable style={{ minWidth: "10rem" }} />
            <Column field="peso_pp_total_kg" header="Peso PP Total (kg)" editor={(options) => floatEditor(options)} sortable style={{ minWidth: "10rem" }} />
            <Column field="cant_cajas_cosechadas" header="Cajas Cosechadas" editor={(options) => numberEditor(options)} sortable style={{ minWidth: "10rem" }} />
            <Column field="frass_fino_total_kg" header="Frass Fino Total (kg)" editor={(options) => floatEditor(options)} sortable style={{ minWidth: "10rem" }} />
            <Column field="material_grueso_total_kg" header="Material Grueso Total (kg)" editor={(options) => floatEditor(options)} sortable style={{ minWidth: "10rem" }} />
            <Column field="cantidad_pp_25g" header="Cantidad PP 25g" editor={(options) => floatEditor(options)} sortable style={{ minWidth: "10rem" }} />
            <Column field="cantidad_pp_totales" header="Cantidad PP Totales" editor={(options) => numberEditor(options)} sortable style={{ minWidth: "10rem" }} />
            <Column field="peso_individual_pp_mg" header="Peso Individual PP (mg)" editor={(options) => floatEditor(options)} sortable style={{ minWidth: "10rem" }} />
            <Column field="cantidad_cajas" header="Cantidad de Cajas" editor={(options) => numberEditor(options)} sortable style={{ minWidth: "10rem" }} />
            <Column field="cantidad_camas_pupacion" header="Cantidad de Camas de Pupación" editor={(options) => floatEditor(options)} sortable style={{ minWidth: "10rem" }} />
            <Column header="Herramientas" rowEditor headerStyle={{ width: "10%", minWidth: "5rem" }} bodyStyle={{ textAlign: "center" }} />
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
          <label htmlFor="num_lote" className="font-bold">
            Número de Lote {submitted && !registro.num_lote && <small className="p-error">Requerido.</small>}
          </label>
          <InputText type="number" id="num_lote" value={registro.num_lote} onChange={(e) => onInputChange(e, "num_lote")} required autoFocus />
          <br />
          <label htmlFor="fec_siembra" className="font-bold">
            Fecha de Siembra {submitted && !registro.fec_siembra && <small className="p-error">Requerido.</small>}
          </label>
          <InputText type="date" id="fec_siembra" value={registro.fec_siembra} onChange={(e) => onInputChange(e, "fec_siembra")} required />
          <br />
          <label htmlFor="fec_cosecha" className="font-bold">
            Fecha de Cosecha {submitted && !registro.fec_cosecha && <small className="p-error">Requerido.</small>}
          </label>
          <InputText type="date" id="fec_cosecha" value={registro.fec_cosecha} onChange={(e) => onInputChange(e, "fec_cosecha")} required />
          <br />
          <label htmlFor="peso_pp_total_kg" className="font-bold">
            Peso PP Total (kg) {submitted && !registro.peso_pp_total_kg && <small className="p-error">Requerido.</small>}
          </label>
          <InputText type="number" step="0.01" id="peso_pp_total_kg" value={registro.peso_pp_total_kg} onChange={(e) => onInputChange(e, "peso_pp_total_kg")} required />
          <br />
          <label htmlFor="cant_cajas_cosechadas" className="font-bold">
            Cajas Cosechadas {submitted && !registro.cant_cajas_cosechadas && <small className="p-error">Requerido.</small>}
          </label>
          <InputText type="number" id="cant_cajas_cosechadas" value={registro.cant_cajas_cosechadas} onChange={(e) => onInputChange(e, "cant_cajas_cosechadas")} required />
          <br />
          <label htmlFor="frass_fino_total_kg" className="font-bold">
            Frass Fino Total (kg) {submitted && !registro.frass_fino_total_kg && <small className="p-error">Requerido.</small>}
          </label>
          <InputText type="number" step="0.01" id="frass_fino_total_kg" value={registro.frass_fino_total_kg} onChange={(e) => onInputChange(e, "frass_fino_total_kg")} required />
          <br />
          <label htmlFor="material_grueso_total_kg" className="font-bold">
            Material Grueso Total (kg) {submitted && !registro.material_grueso_total_kg && <small className="p-error">Requerido.</small>}
          </label>
          <InputText type="number" step="0.01" id="material_grueso_total_kg" value={registro.material_grueso_total_kg} onChange={(e) => onInputChange(e, "material_grueso_total_kg")} required />
          <br />
          <label htmlFor="cantidad_pp_25g" className="font-bold">
            Cantidad PP 25g {submitted && !registro.cantidad_pp_25g && <small className="p-error">Requerido.</small>}
          </label>
          <InputText type="number" step="0.01" id="cantidad_pp_25g" value={registro.cantidad_pp_25g} onChange={(e) => onInputChange(e, "cantidad_pp_25g")} required />
          <br />
          <label htmlFor="cantidad_pp_totales" className="font-bold">
            Cantidad PP Totales {submitted && !registro.cantidad_pp_totales && <small className="p-error">Requerido.</small>}
          </label>
          <InputText type="number" id="cantidad_pp_totales" value={registro.cantidad_pp_totales} onChange={(e) => onInputChange(e, "cantidad_pp_totales")} required />
          <br />
          <label htmlFor="peso_individual_pp_mg" className="font-bold">
            Peso Individual PP (mg) {submitted && !registro.peso_individual_pp_mg && <small className="p-error">Requerido.</small>}
          </label>
          <InputText type="number" step="0.01" id="peso_individual_pp_mg" value={registro.peso_individual_pp_mg} onChange={(e) => onInputChange(e, "peso_individual_pp_mg")} required />
          <br />
          <label htmlFor="cantidad_cajas" className="font-bold">
            Cantidad de Cajas {submitted && !registro.cantidad_cajas && <small className="p-error">Requerido.</small>}
          </label>
          <InputText type="number" id="cantidad_cajas" value={registro.cantidad_cajas} onChange={(e) => onInputChange(e, "cantidad_cajas")} required />
          <br />
          <label htmlFor="cantidad_camas_pupacion" className="font-bold">
            Cantidad de Camas de Pupación {submitted && !registro.cantidad_camas_pupacion && <small className="p-error">Requerido.</small>}
          </label>
          <InputText type="number" step="0.01" id="cantidad_camas_pupacion" value={registro.cantidad_camas_pupacion} onChange={(e) => onInputChange(e, "cantidad_camas_pupacion")} required />
        </div>
      </Dialog>
    </>
  );
}

export default ControlRendimientoCosechaReproduccion;