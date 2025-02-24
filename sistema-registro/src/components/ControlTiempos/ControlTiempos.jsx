import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ControlTiempos.css";
import supabase from "../../supabaseClient";
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

function ControlTiempos() {
  let emptyRegister = {
    fecha_registro: "",
    hora_paro: "",
    hora_arranque: "",
    area_paro: "",
    clase_paro: "",
    detalle_paro: "",
    cant_horas_paro: "",
    hora_registro: "", // Nueva columna
    observaciones: "", // Nueva columna
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

  const areasParo = [
    "Horno Multilevel",
    "Horno Microondas",
    "Empaque",
    "Tamizador",
    "Dieta",
  ];

  const clasesParo = [
    "A: Mantenimiento: fallo mecánico.",
    "B: Mantenimiento: fallo electrico.",
    "C: Inocuidad: limpieza industrial.",
    "D: Producción: falta de materia prima o material.",
    "E: Recurso humano: falta de mano de obra. ",
    "F: Calidad: defecto o fallos de producto.",
    "G: Salud ocupacional: riesgos, evacuación, seguridad u accidentes.",
    "H: Arranque y calentamiento de linea.",
    "I: Producción: se termina de procesar materi prima.",
    "J: Equipo mal armado.",
    "K: Recurso humano: reunión con personal.",
    "L: Tiempo de alimentación.",
    "M: Se termina turno de trabajo.",
    "N: Acumulación de producto en proceso.",
    "Ñ: Falta de cajas vacías/Falta de tarimas.",
    "O: Falta de espacio por acumulación de cajas sembradas a piso.",
    "P: Falta de 5DOLS para siembra.",
    "Q: En espera de liberación de tanda.",
    "R: Por falta de dieta en tolva para dosificar cajas.",
  ]; // Opciones para la clase de paro

  const fetchRegistros = async () => {
    try {
      const { data, error } = await supabase.from("Control_de_tiempos").select();
      if (data) {
        // Formatear la fecha al formato día/mes/año
        const registrosFormateados = data.map((registro) => ({
          ...registro,
          fecha_registro: formatearFecha(registro.fecha_registro),
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

  // Función para obtener la hora actual en formato HH:MM
  const obtenerHoraActual = () => {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, "0");
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    return `${horas}:${minutos}`;
  };

  // Función para calcular la diferencia en horas y minutos
  const calcularHorasParo = (horaParo, horaArranque) => {
    if (!horaParo || !horaArranque) return "";

    const [horaParoH, horaParoM] = horaParo.split(":").map(Number);
    const [horaArranqueH, horaArranqueM] = horaArranque.split(":").map(Number);

    const diferenciaMinutos = (horaArranqueH * 60 + horaArranqueM) - (horaParoH * 60 + horaParoM);
    const horas = Math.floor(diferenciaMinutos / 60);
    const minutos = diferenciaMinutos % 60;

    // Formatear la salida como "## horas y ## minutos"
    return `${horas} horas y ${minutos} minutos`;
  };

  const saveRegistro = async () => {
    setSubmitted(true);
    if (
      !registro.fecha_registro ||
      !registro.hora_paro ||
      !registro.hora_arranque ||
      !registro.area_paro ||
      !registro.clase_paro ||
      !registro.detalle_paro
    ) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Llena todos los campos",
        life: 3000,
      });
      return;
    }

    // Convertir la fecha al formato ISO antes de guardar
    const fechaISO = convertirFechaISO(registro.fecha_registro);

    // Obtener la hora actual
    const horaActual = obtenerHoraActual();

    // Calcular la cantidad de horas paro
    const horasParo = calcularHorasParo(registro.hora_paro, registro.hora_arranque);
    const registroConHoras = {
      ...registro,
      fecha_registro: fechaISO,
      cant_horas_paro: horasParo,
      hora_registro: horaActual, // Agregar la hora de registro
    };

    try {
      const { id, ...registroSinId } = registroConHoras;
      const { data, error } = await supabase
        .from("Control_de_tiempos")
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

    // Si se cambia hora_paro o hora_arranque, recalcular cant_horas_paro
    if (name === "hora_paro" || name === "hora_arranque") {
      _registro.cant_horas_paro = calcularHorasParo(_registro.hora_paro, _registro.hora_arranque);
    }

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
    doc.text("Registros de Control de Tiempos", 14, 22);

    doc.autoTable({
      head: [["Fecha Registro", "Hora Paro", "Hora Arranque", "Área Paro", "Clase Paro", "Detalle Paro", "Cantidad Horas Paro", "Hora Registro", "Observaciones"]],
      body: selectedRegistros.map((registro) => [
        registro.fecha_registro,
        registro.hora_paro,
        registro.hora_arranque,
        registro.area_paro,
        registro.clase_paro,
        registro.detalle_paro,
        registro.cant_horas_paro,
        registro.hora_registro,
        registro.observaciones,
      ]),
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save("Control_de_Tiempos.pdf");
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

    const headers = ["Fecha Registro", "Hora Paro", "Hora Arranque", "Área Paro", "Clase Paro", "Detalle Paro", "Cantidad Horas Paro", "Hora Registro", "Observaciones"];
    const rows = selectedRegistros.map((registro) => [
      registro.fecha_registro,
      registro.hora_paro,
      registro.hora_arranque,
      registro.area_paro,
      registro.clase_paro,
      registro.detalle_paro,
      registro.cant_horas_paro,
      registro.hora_registro,
      registro.observaciones,
    ]);

    const dataToExport = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(wb, "Control_de_Tiempos.xlsx");
  };

  return (
    <>
      <div className="controltiempos-container">
        <Toast ref={toast} />
        <h1>Control de Tiempos</h1>
        <div className="welcome-message">
          <p>
            Bienvenido al sistema de control de tiempos. Aquí puedes gestionar los registros de paros y arranques.
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
            <Column field="fecha_registro" header="Fecha Registro" sortable />
            <Column field="hora_registro" header="Hora Registro" sortable />
            <Column field="hora_paro" header="Hora Paro" sortable />
            <Column field="hora_arranque" header="Hora Arranque" sortable />
            <Column field="cant_horas_paro" header="Cantidad Horas Paro" sortable />
            <Column field="area_paro" header="Área Paro" sortable />
            <Column field="clase_paro" header="Clase Paro" sortable />
            <Column field="detalle_paro" header="Detalle Paro" sortable />
            <Column field="observaciones" header="Otras observaciones" sortable />
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
          <label htmlFor="fecha_registro" className="font-bold">
            Fecha Registro{" "}
            {submitted && !registro.fecha_registro && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="date"
            id="fecha_registro"
            value={registro.fecha_registro}
            onChange={(e) => onInputChange(e, "fecha_registro")}
            required
            autoFocus
          />
          <br />
          <label htmlFor="hora_paro" className="font-bold">
            Hora Paro{" "}
            {submitted && !registro.hora_paro && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="time"
            id="hora_paro"
            value={registro.hora_paro}
            onChange={(e) => onInputChange(e, "hora_paro")}
            required
          />
          <br />
          <label htmlFor="hora_arranque" className="font-bold">
            Hora Arranque{" "}
            {submitted && !registro.hora_arranque && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="time"
            id="hora_arranque"
            value={registro.hora_arranque}
            onChange={(e) => onInputChange(e, "hora_arranque")}
            required
          />
          <label htmlFor="cant_horas_paro" className="font-bold">
            Cantidad Horas Paro{" "}
            {submitted && !registro.cant_horas_paro && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="text"
            id="cant_horas_paro"
            value={registro.cant_horas_paro}
            readOnly
          />
          <br />
          <label htmlFor="area_paro" className="font-bold">
            Área Paro{" "}
            {submitted && !registro.area_paro && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <Dropdown
            id="area_paro"
            value={registro.area_paro}
            options={areasParo}
            onChange={(e) => onInputChange(e, "area_paro")}
            placeholder="Selecciona un área"
            required
          />
          <br />
          <label htmlFor="clase_paro" className="font-bold">
            Clase Paro{" "}
            {submitted && !registro.clase_paro && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <Dropdown
            id="clase_paro"
            value={registro.clase_paro}
            options={clasesParo}
            onChange={(e) => onInputChange(e, "clase_paro")}
            placeholder="Selecciona una clase"
            required
          />
          <br />
          <label htmlFor="detalle_paro" className="font-bold">
            Detalle Paro{" "}
            {submitted && !registro.detalle_paro && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            id="detalle_paro"
            value={registro.detalle_paro}
            onChange={(e) => onInputChange(e, "detalle_paro")}
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

export default ControlTiempos;