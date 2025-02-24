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

  // Función para formatear la fecha en formato día/mes/año
  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0"); // Los meses comienzan en 0
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  // Función para convertir la fecha de día/mes/año a formato ISO (año-mes-día)
  const convertirFechaISO = (fecha) => {
    if (!fecha) return "";
    const [dia, mes, año] = fecha.split("/");
    return `${año}-${mes}-${dia}`;
  };

  const fetchRegistros = async () => {
    try {
      const { data, error } = await supabase
        .from("Control_Calidad_Cosecha")
        .select();
      if (data) {
        // Formatear las fechas al formato día/mes/año
        const registrosFormateados = data.map((registro) => ({
          ...registro,
          fec_registro: formatearFecha(registro.fec_registro),
          fec_cosecha: formatearFecha(registro.fec_cosecha),
        }));
        setRegistros(registrosFormateados);
      }
    } catch {
      console.log("Error en la conexión a la base de datos");
    }
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  const obtenerHoraActual = () => {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, "0");
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    return `${horas}:${minutos}`;
  };

  const saveRegistro = async () => {
    setSubmitted(true);
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

    const horaActual = obtenerHoraActual();
    const fechaActual = new Date().toISOString().split('T')[0];
    const registroConHora = {
      ...registro,
      fec_registro: convertirFechaISO(fechaActual),
      hor_registro: horaActual,
      fec_cosecha: convertirFechaISO(registro.fec_cosecha),
    };

    try {
      const { id, ...registroSinId } = registroConHora;
      const { data, error } = await supabase
        .from("Control_Calidad_Cosecha")
        .insert([registroSinId]);
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
    doc.text("Registros de Control de Calidad de Cosecha", 14, 22);

    doc.autoTable({
      head: [
        [
          "Lote ID",
          "Días Rezago",
          "Temp Ambiental",
          "Hum Ambiental",
          "Hum Frass",
          "Temp Frass",
          "Color",
          "Tamaño",
          "Peso",
          "Total Individuos",
          "Mortalidad",
          "Fecha Registro",
          "Hora Registro",
          "Observaciones",
          "Fecha Cosecha",
          "Hora Inicio",
          "Hora Fin",
          "Línea Producción",
        ],
      ],
      body: selectedRegistros.map((registro) => [
        registro.lote_id,
        registro.dias_rezago,
        registro.temp_ambiental,
        registro.hum_ambiental,
        registro.hum_frass,
        registro.temp_frass,
        registro.color,
        registro.tamano,
        registro.peso,
        registro.total_individuos,
        registro.mortalidad,
        formatearFecha(registro.fec_registro),
        registro.hor_registro,
        registro.observaciones,
        formatearFecha(registro.fec_cosecha),
        registro.hor_inicio,
        registro.hor_fin,
        registro.linea_produc,
      ]),
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save("Control_Calidad_Cosecha.pdf");
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

    const headers = [
      "Lote ID",
      "Días Rezago",
      "Temp Ambiental",
      "Hum Ambiental",
      "Hum Frass",
      "Temp Frass",
      "Color",
      "Tamaño",
      "Peso",
      "Total Individuos",
      "Mortalidad",
      "Fecha Registro",
      "Hora Registro",
      "Observaciones",
      "Fecha Cosecha",
      "Hora Inicio",
      "Hora Fin",
      "Línea Producción",
    ];
    const rows = selectedRegistros.map((registro) => [
      registro.lote_id,
      registro.dias_rezago,
      registro.temp_ambiental,
      registro.hum_ambiental,
      registro.hum_frass,
      registro.temp_frass,
      registro.color,
      registro.tamano,
      registro.peso,
      registro.total_individuos,
      registro.mortalidad,
      formatearFecha(registro.fec_registro),
      registro.hor_registro,
      registro.observaciones,
      formatearFecha(registro.fec_cosecha),
      registro.hor_inicio,
      registro.hor_fin,
      registro.linea_produc,
    ]);

    const dataToExport = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(wb, "Control_Calidad_Cosecha.xlsx");
  };

  return (
    <>
      <div className="controltiempos-container">
        <Toast ref={toast} />
        <h1>Control de Calidad de Cosecha</h1>
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
            <Column field="dias_rezago" header="Días Rezago" sortable />
            <Column field="temp_ambiental" header="Temp Ambiental" sortable />
            <Column field="hum_ambiental" header="Hum Ambiental" sortable />
            <Column field="hum_frass" header="Hum Frass" sortable />
            <Column field="temp_frass" header="Temp Frass" sortable />
            <Column field="color" header="Color" sortable />
            <Column field="tamano" header="Tamaño" sortable />
            <Column field="peso" header="Peso" sortable />
            <Column field="total_individuos" header="Total Individuos" sortable />
            <Column field="mortalidad" header="Mortalidad" sortable />
            <Column field="fec_registro" header="Fecha Registro" sortable />
            <Column field="hor_registro" header="Hora Registro" sortable />
            <Column field="observaciones" header="Observaciones" sortable />
            <Column field="fec_cosecha" header="Fecha Cosecha" sortable />
            <Column field="hor_inicio" header="Hora Inicio" sortable />
            <Column field="hor_fin" header="Hora Fin" sortable />
            <Column field="linea_produc" header="Línea Producción" sortable />
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