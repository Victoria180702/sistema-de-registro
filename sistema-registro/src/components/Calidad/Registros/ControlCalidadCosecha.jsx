import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ControlCalidadCosecha.css"; // Importa el CSS
import supabase from "../../../supabaseClient";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo2 from "../../../assets/mosca.png";

function ControlCalidadCosecha() {
  let emptyRegister = {
    lote_id: "",
    dias_rezago: "",
    temp_ambiental: "",
    hum_ambiental: "",
    hum_frass: "",
    temp_frass: "",
    color: "",
    tamano: "",
    peso: "",
    total_individuos: "",
    mortalidad: "",
    observaciones: "",
    fec_cosecha: "",
    hor_inicio: "",
    hor_fin: "",
    linea_produc: "",
  };

  const [registros, setRegistros] = useState([]);
  const [registro, setRegistro] = useState(emptyRegister);
  const toast = useRef(null);
  const dt = useRef(null);
  const [selectedRegistros, setSelectedRegistros] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [registroDialog, setRegistroDialog] = useState(false);
  const navigate = useNavigate();
  

  // Opciones para el campo "linea_produc"
  const lineasProduccion = ["Producción", "Reproducción"];
  //Errores de validación
    const [observacionesObligatorio, setObservacionesObligatorio] =
      useState(false);
    const [erroresValidacion, setErroresValidacion] = useState({
      dias_rezago: false,
      color: false,
      tamano: false,
      peso: false,
    });

  const convertirFecha = (fecha) =>
    fecha ? fecha.split("-").reverse().join("/") : "";

  const fetchRegistros = async () => {
    try {
      const { data, error } = await supabase
        .from("Control_Calidad_Cosecha")
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

    // Validar los campos
    const isDiazRezagoInvalido = registro.dias_rezago < 1 || registro.dias_rezago > 4;
    const isCajasInoculadasDestinoInvalido =
      registro.color < 3 ||
      registro.color > 5;
      const isTamanoInvalido =
      registro.tamano < 1.5 ||
      registro.tamano > 2;
      const isPesoInvalido =
      registro.peso < 1.8 ||
      registro.peso > 2;
    
    // Actualizar el estado de errores
    setErroresValidacion({
      dias_rezago: isDiazRezagoInvalido,
      color: isCajasInoculadasDestinoInvalido,
      tamano: isTamanoInvalido,
      peso: isPesoInvalido,
    });
    const valoresFueraDeRango =
      isDiazRezagoInvalido ||
      isCajasInoculadasDestinoInvalido ||
      isTamanoInvalido ||
      isPesoInvalido;

    if (
      !registro.lote_id ||
      !registro.dias_rezago ||
      !registro.temp_ambiental ||
      !registro.hum_ambiental ||
      !registro.hum_frass ||
      !registro.temp_frass ||
      !registro.color ||
      !registro.tamano ||
      !registro.peso ||
      !registro.total_individuos ||
      !registro.mortalidad ||
      !registro.fec_cosecha ||
      !registro.hor_inicio ||
      !registro.hor_fin ||
      !registro.linea_produc
    ) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Llena todos los campos",
        life: 3000,
      });
      return;
    }

    // Validación principal
    if (valoresFueraDeRango && !registro.observaciones) {
      setObservacionesObligatorio(true);
      const currentErrores = {
        "Días de Rezago": isDiazRezagoInvalido,
        "Color": isCajasInoculadasDestinoInvalido,
        "Tamaño": isTamanoInvalido,
        "Peso": isPesoInvalido,
      };

      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Debe agregar observaciones. Campos inválidos: ${Object.keys(
          currentErrores
        )
          .filter((k) => currentErrores[k])
          .join(", ")}`,
        life: 3000,
      });
      return;
    }

    setObservacionesObligatorio(false);
    setErroresValidacion({
      dias_rezago: false,
      color: false,
      tamano: false,
      peso: false,
    });

    try {
      const currentDate = formatDateTime(new Date(), "DD/MM/YYYY"); // Fecha actual
      const currentTime = formatDateTime(new Date(), "hh:mm A"); // Hora actual

      const { data, error } = await supabase
        .from("Control_Calidad_Cosecha")
        .insert([
          {
            lote_id: registro.lote_id,
            dias_rezago: registro.dias_rezago,
            temp_ambiental: registro.temp_ambiental,
            hum_ambiental: registro.hum_ambiental,
            hum_frass: registro.hum_frass,
            temp_frass: registro.temp_frass,
            color: registro.color,
            tamano: registro.tamano,
            peso: registro.peso,
            total_individuos: registro.total_individuos,
            mortalidad: registro.mortalidad,
            observaciones: registro.observaciones,
            hor_inicio: registro.hor_inicio,
            hor_fin: registro.hor_fin,
            linea_produc: registro.linea_produc,
            fec_registro: currentDate,
            hor_registro: currentTime,
            fec_cosecha: convertirFecha(registro.fec_cosecha)
          },
        ]); //Cambiar aqui este insert y poner cada columna ya que las fechas se tienen que formatear
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
        .from("Control_Calidad_Cosecha")
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


  const onInputChange = (e, name) => {
    let val = e.target.value;
    let _registro = { ...registro };
    _registro[name] = val;
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
      <InputText
        type="search"
        onInput={(e) => setGlobalFilter(e.target.value)}
        placeholder="Buscador Global..."
      />
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

  const cols = [
    { field: "lote_id", header: "Lote ID" },
    { field: "dias_rezago", header: "Días Rezago" },
    { field: "temp_ambiental", header: "Temp Ambiental" },
    { field: "hum_ambiental", header: "Hum Ambiental" },
    { field: "hum_frass", header: "Hum Frass" },
    { field: "temp_frass", header: "Temp Frass" },
    { field: "color", header: "Color" },
    { field: "tamano", header: "Tamaño" },
    { field: "peso", header: "Peso" },
    { field: "total_individuos", header: "Total Individuos" },
    { field: "mortalidad", header: "Mortalidad" },
    { field: "fec_registro", header: "Fecha Registro" },
    { field: "hor_registro", header: "Hora Registro" },
    { field: "observaciones", header: "Observaciones" },
    { field: "fec_cosecha", header: "Fecha Cosecha" },
    { field: "hor_inicio", header: "Hora Inicio" },
    { field: "hor_fin", header: "Hora Fin" },
    { field: "linea_produc", header: "Línea Producción" },
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
      doc.text("Registros de Control Rendimiento Cosecha y Frass", 14, 22);
  
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

  return (
    <>
      <div className="controltiempos-container">
        <Toast ref={toast} />
        <h1>
          
          <img src={logo2} alt="mosca" className="logo2" />
          Control de Calidad de Cosecha
          
        </h1>
        <div className="welcome-message">
          <p>
            Bienvenido al sistema de control de calidad de cosecha. Aquí puedes
            gestionar los registros de calidad.
          </p>
        </div>
        <div className="buttons-container">
          <button onClick={() => navigate(-1)} className="return-button">
            Volver
          </button>
          <br />
          <br />
          <button onClick={() => navigate(-2)} className="menu-button">
            Menú principal
          </button>
        </div>

        <div className="tabla-scroll">
          <Toolbar
            className="mb-4"
            left={leftToolbarTemplate}
            right={rightToolbarTemplate}
          ></Toolbar>
          <DataTable
           editMode="row"
           onRowEditComplete={onRowEditComplete}
           ref={dt}
            value={registros}
            selection={selectedRegistros}
            onSelectionChange={(e) => setSelectedRegistros(e.value)}
            globalFilter={globalFilter}
            header={header}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} Registros"
          >
            <Column selectionMode="multiple" exportable={false}></Column>
            <Column field="lote_id" header="Lote ID" sortable />
            <Column field="dias_rezago" header="Días Rezago" editor={(options) => numberEditor(options)} sortable/>
            <Column field="temp_ambiental" header="Temp Ambiental" editor={(options) => floatEditor(options)} sortable />
            <Column field="hum_ambiental" header="Hum Ambiental" editor={(options) => floatEditor(options)} sortable />
            <Column field="hum_frass" header="Hum Frass" editor={(options) => floatEditor(options)} sortable />
            <Column field="temp_frass" header="Temp Frass" editor={(options) => floatEditor(options)} sortable />
            <Column field="color" header="Color" editor={(options) => textEditor(options)} sortable />
            <Column field="tamano" header="Tamaño" editor={(options) => floatEditor(options)} sortable />
            <Column field="peso" header="Peso" editor={(options) => floatEditor(options)} sortable />
            <Column field="total_individuos" header="Total Individuos" editor={(options) => numberEditor(options)} sortable />
            <Column field="mortalidad" header="Mortalidad" editor={(options) => numberEditor(options)} sortable />
            <Column field="fec_cosecha" header="Fecha Cosecha" editor={(options) => dateEditor(options)} sortable />
            <Column field="hor_inicio" header="Hora Inicio" editor={(options) => timeEditor(options)} sortable />
            <Column field="hor_fin" header="Hora Fin" editor={(options) => timeEditor(options)} sortable />
            <Column field="linea_produc" header="Línea Producción" editor={(options) => textEditor(options)} sortable />
            <Column field="fec_registro" header="Fecha Registro" sortable />
            <Column field="hor_registro" header="Hora Registro" sortable />
            <Column field="observaciones" header="Observaciones" editor={(options) => textEditor(options)} sortable />
            <Column
                          header="Herramientas"
                          rowEditor={allowEdit}
                          headerStyle={{ width: "10%", minWidth: "5rem" }}
                          bodyStyle={{ textAlign: "center" }}
            ></Column>
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
          <label htmlFor="lote_id" className="font-bold">
            Lote ID{" "}
            {submitted && !registro.lote_id && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            id="lote_id"
            value={registro.lote_id}
            onChange={(e) => onInputChange(e, "lote_id")}
            required
            autoFocus
          />
          <br />
          <label htmlFor="dias_rezago" className="font-bold">
            Días Rezago{" "}
            {submitted && !registro.dias_rezago && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.dias_rezago && (
              <small className="p-error">
                Días de Rezago debe de ser del 1 al 4.
              </small>
            )}
          </label>
          <InputText
            type="number"
            id="dias_rezago"
            value={registro.dias_rezago}
            onChange={(e) => onInputChange(e, "dias_rezago")}
            required
            
          />
          <br />
          <label htmlFor="temp_ambiental" className="font-bold">
            Temp Ambiental{" "}
            {submitted && !registro.temp_ambiental && (
              <small className="p-error">Requerido.</small>
            )}
            
          </label>
          <InputText
            type="number"
            id="temp_ambiental"
            value={registro.temp_ambiental}
            onChange={(e) => onInputChange(e, "temp_ambiental")}
            required
          />
          <br />
          <label htmlFor="hum_ambiental" className="font-bold">
            Hum Ambiental{" "}
            {submitted && !registro.hum_ambiental && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="hum_ambiental"
            value={registro.hum_ambiental}
            onChange={(e) => onInputChange(e, "hum_ambiental")}
            required
          />
          <br />
          <label htmlFor="hum_frass" className="font-bold">
            Hum Frass{" "}
            {submitted && !registro.hum_frass && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="hum_frass"
            value={registro.hum_frass}
            onChange={(e) => onInputChange(e, "hum_frass")}
            required
          />
          <br />
          <label htmlFor="temp_frass" className="font-bold">
            Temp Frass{" "}
            {submitted && !registro.temp_frass && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="temp_frass"
            value={registro.temp_frass}
            onChange={(e) => onInputChange(e, "temp_frass")}
            required
          />
          <br />
          <label htmlFor="color" className="font-bold">
            Color{" "}
            {submitted && !registro.color && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.color && (
              <small className="p-error">
                Item de Color debe de estar entre el 3 a 5.
              </small>
            )}
          </label>
          <InputText
            id="color"
            value={registro.color}
            onChange={(e) => onInputChange(e, "color")}
            required
          />
          <br />
          <label htmlFor="tamano" className="font-bold">
            Tamaño{" "}
            {submitted && !registro.tamano && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.tamano && (
              <small className="p-error">
                El Tamaño debe de ser entre 1.5 a 2.
              </small>
            )}
          </label>
          <InputText
            type="number"
            id="tamano"
            value={registro.tamano}
            onChange={(e) => onInputChange(e, "tamano")}
            required
          />
          <br />
          <label htmlFor="peso" className="font-bold">
            Peso{" "}
            {submitted && !registro.peso && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.peso && (
              <small className="p-error">
                El peso debe de estar entre 1.8 a 2.
              </small>
            )}
          </label>
          <InputText
            type="number"
            id="peso"
            value={registro.peso}
            onChange={(e) => onInputChange(e, "peso")}
            required
          />
          <br />
          <label htmlFor="total_individuos" className="font-bold">
            Total Individuos{" "}
            {submitted && !registro.total_individuos && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="total_individuos"
            value={registro.total_individuos}
            onChange={(e) => onInputChange(e, "total_individuos")}
            required
          />
          <br />
          <label htmlFor="mortalidad" className="font-bold">
            Mortalidad{" "}
            {submitted && !registro.mortalidad && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="mortalidad"
            value={registro.mortalidad}
            onChange={(e) => onInputChange(e, "mortalidad")}
            required
          />
          <br />
          <label htmlFor="fec_cosecha" className="font-bold">
            Fecha Cosecha{" "}
            {submitted && !registro.fec_cosecha && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="date"
            id="fec_cosecha"
            value={registro.fec_cosecha}
            onChange={(e) => onInputChange(e, "fec_cosecha")}
            required
          />
          <br />
          <label htmlFor="hor_inicio" className="font-bold">
            Hora Inicio{" "}
            {submitted && !registro.hor_inicio && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="time"
            id="hor_inicio"
            value={registro.hor_inicio}
            onChange={(e) => onInputChange(e, "hor_inicio")}
            required
          />
          <br />
          <label htmlFor="hor_fin" className="font-bold">
            Hora Fin{" "}
            {submitted && !registro.hor_fin && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="time"
            id="hor_fin"
            value={registro.hor_fin}
            onChange={(e) => onInputChange(e, "hor_fin")}
            required
          />
          <br />
          <label htmlFor="linea_produc" className="font-bold">
            Línea Producción{" "}
            {submitted && !registro.linea_produc && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <Dropdown
            id="linea_produc"
            value={registro.linea_produc}
            options={lineasProduccion}
            onChange={(e) => onInputChange(e, "linea_produc")}
            placeholder="Selecciona una línea"
            required
          />
          <br />
          <label htmlFor="observaciones" className="font-bold">
          Observaciones{" "}
          {observacionesObligatorio && (
              <small className="p-error">Requerido por fuera de rango.</small>
            )}
          </label>
          <InputText
            id="observaciones"
            value={registro.observaciones}
            onChange={(e) => onInputChange(e, "observaciones")}
          />
          <br />
        </div>
      </Dialog>
    </>
  );
}

export default ControlCalidadCosecha;