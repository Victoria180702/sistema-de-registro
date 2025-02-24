import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

//Imports de estilos
import logo2 from "../../../assets/mosca.png";
import "./ControlRendimientoCosechayFrass.css";

//Imports de Supabase
import supabase from "../../../supabaseClient"; //Importa la variable supabase del archivo supabaseClient.js que sirve para conectarse con la base de datos y que funcione como API

//PRIME REACT
import "primereact/resources/themes/bootstrap4-light-blue/theme.css"; //theme
import "primeicons/primeicons.css"; //icons

//PRIME REACT COMPONENTS
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

//Imports de exportar
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

function ControlRendimientoCosechayFrass() {
  let emptyRegister = {
    fec_siembra: "",
    fec_cosecha: "",
    cant_cajas_cosechadas: "",
    kg_larva_fresca: "",
    cant_cajas_desechadas: "",
    kg_larva_desechada: "",
    kg_larva_desecho_limpia: "",
    kg_total_frass: "",
    kg_material_grueso: "",
    fec_registro: "",
    hor_registro: "",
    observaciones: "",
    fec_almacenaje_frass: "",
    cant_sacos: "",
    tipo_produccion: "",
    tipo_control: "",
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

  // Función para formatear la fecha en formato día/mes/año
  //   const formatearFecha = (fecha) => {
  //     if (!fecha) return "";
  //     const date = new Date(fecha);
  //     const dia = String(date.getDate()).padStart(2, "0");
  //     const mes = String(date.getMonth() + 1).padStart(2, "0"); // Los meses comienzan en 0
  //     const año = date.getFullYear();
  //     return `${dia}/${mes}/${año}`;
  //   };

  // Función para convertir la fecha de día/mes/año a formato ISO (año-mes-día)
  const convertirFecha = (fecha) =>
    fecha ? fecha.split("-").reverse().join("/") : "";

  // Opciones para el campo "tipo_control"
  const tiposControl = ["Prueba", "Control"];
  const tiposProduccion = ["Produccion", "Hatchery"];
  const fetchRegistros = async () => {
    try {
      const { data, error } = await supabase
        .from("Control_Rendimiento_CosechayFrass")
        .select();
      if (data) {
        setRegistros(data);
      }
      //     // Formatear las fechas al formato día/mes/año
      //     const registrosFormateados = data.map((registro) => ({
      //       ...registro,
      //     //   fecha_registro: formatearFecha(registro.fec_registro),
      //       fecha_siembra: formatearFecha(registro.fec_siembra),
      //       fecha_cosecha: formatearFecha(registro.fec_cosecha),
      //       fecha_almacenaje_frass: formatearFecha(registro.fec_almacenaje_frass),
      //     }));
      //     setRegistros(registrosFormateados);
      //   }
    } catch {
      console.log("Error en la conexión a la base de datos");
    }
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  //Inicio Formatear la FECHA DE REGISTRO
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
  //Fin Formatear la FECHA DE REGISTRO

  const saveRegistro = async () => {
    setSubmitted(true);
    if (
      !registro.fec_siembra ||
      !registro.fec_cosecha ||
      !registro.cant_cajas_cosechadas ||
      !registro.kg_larva_fresca ||
      !registro.cant_cajas_desechadas ||
      !registro.kg_larva_desechada ||
      !registro.kg_larva_desecho_limpia ||
      !registro.kg_total_frass ||
      !registro.kg_material_grueso ||
      !registro.tipo_control ||
      !registro.tipo_produccion ||
      !registro.observaciones ||
      !registro.fec_almacenaje_frass ||
      !registro.cant_sacos
    ) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Llena todos los campos ",
        life: 3000,
      });
      return;
    }
    try {
      const currentDate = formatDateTime(new Date(), "DD/MM/YYYY"); // Solo fecha
      const currentTime = formatDateTime(new Date(), "hh:mm A"); // Fecha en formato ISO 8601
      const { data, error } = await supabase
        .from("Control_Rendimiento_CosechayFrass")
        .insert([
          {
            fec_siembra: convertirFecha(registro.fec_siembra),
            fec_cosecha: convertirFecha(registro.fec_cosecha),
            cant_cajas_cosechadas: registro.cant_cajas_cosechadas,
            kg_larva_fresca: registro.kg_larva_fresca,
            cant_cajas_desechadas: registro.cant_cajas_desechadas,
            kg_larva_desechada: registro.kg_larva_desechada,
            kg_larva_desecho_limpia: registro.kg_larva_desecho_limpia,
            kg_total_frass: registro.kg_total_frass,
            kg_material_grueso: registro.kg_material_grueso,
            fec_registro: currentDate,
            hor_registro: currentTime,
            observaciones: registro.observaciones,
            fec_almacenaje_frass: convertirFecha(registro.fec_almacenaje_frass),
            cant_sacos: registro.cant_sacos,
            tipo_produccion: registro.tipo_produccion,
            tipo_control: registro.tipo_control,
          },
        ]);

      if (error) {
        console.error("Error en Supabase:", error);
        throw new Error(
          error.message || "Error desconocido al guardar en Supabase"
        );
      }

      toast.current.show({
        severity: "success",
        summary: "Exitoso",
        detail: "Registro guardado exitosamente",
        life: 3000,
      });

      // Limpia el estado
      setRegistro(emptyRegister);
      setRegistroDialog(false);
      setSubmitted(false);
      fetchRegistros();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Ocurrió un error al crear el usuario",
        life: 3000,
      });
    }
  };

  const dateEditor = (options) => {
    // Función para convertir de dd/mm/yyyy a yyyy-mm-dd
    const convertToInputFormat = (date) => {
      if (!date) return ""; // Si no hay fecha, retorna vacío
      const [day, month, year] = date.split("/"); // Descompone la fecha
      return `${year}-${month}-${day}`; // Retorna en formato yyyy-mm-dd
    };
    const convertToDatabaseFormat = (date) => {
        if (!date) return ""; // Si no hay fecha, retorna vacío
        const [year, month, day] = date.split("-"); // Descompone la fecha
        return `${day}/${month}/${year}`; // Retorna en formato dd/mm/yyyy
      };
    
      return (
        <InputText
          type="date"
          value={convertToInputFormat(options.value)} // Convierte al formato adecuado para el input
          onChange={(e) => {
            const selectedDate = e.target.value; // Fecha en formato yyyy-mm-dd
            options.editorCallback(convertToDatabaseFormat(selectedDate)); // Convierte a dd/mm/yyyy y llama al callback
          }}
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
        .from("Control_Rendimiento_CosechayFrass")
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


  // INICIO Exportar a Excel y PDF
  const cols = [
    { field: "tipo_produccion", header: "Tipo Producción" },
    { field: "tipo_control", header: "Tipo Control" },
    { field: "fec_siembra", header: "Fecha Siembra" },
    { field: "fec_cosecha", header: "Fecha Cosecha" },
    { field: "cant_cajas_cosechadas", header: "Cajas Cosechadas" },
    { field: "kg_larva_fresca", header: "Larva Fresca (KG)" },
    { field: "cant_cajas_desechadas", header: "Cajas Desechadas" },
    { field: "kg_larva_desechada", header: "Larva Desechada Bloque (KG)" },
    { field: "kg_larva_desecho_limpia", header: "Desecho Larva Limpia (KG)" },
    { field: "kg_total_frass", header: "Total Frass (KG)" },
    { field: "kg_material_grueso", header: "Material Grueso (KG)" },
    { field: "cant_sacos", header: "Sacos" },
    { field: "fec_almacenaje_frass", header: "Fecha Almacenaje Frass" },
    { field: "observaciones", header: "Observaciones" },
    {field: "registrado", header: "Registrado" },
  ];

  // Mapeo de columnas para jsPDF-Autotable
  const exportColumns = cols.map((col) => ({
    title: col.header, // Título del encabezado
    dataKey: col.field, // Llave de datos
  }));
  
  const exportPdf = () => {
    if (selectedRegistros.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "No hay filas seleccionadas para exportar.",
        life: 3000,
      });
      return; // Detener la ejecución si no hay filas seleccionadas
    }
  
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Registros de Control Rendimiento Cosecha y Frass", 14, 22);
  
    const exportData = selectedRegistros.map(({ fec_registro, hor_registro, ...row }) => ({
      ...row,
      registrado: `${fec_registro || ""} ${hor_registro || ""}`, // Combina las fechas
    }));
  
    const columnsPerPage = 5; // Número de columnas por página
    const maxHeightPerColumn = 10; // Altura de cada fila
    const rowHeight = exportColumns.length * maxHeightPerColumn + 10; // Altura total del registro
    let currentY = 30; // Inicializar la posición vertical
  
    // Estilos
    const headerColor = [41, 128, 185]; // Color de fondo del encabezado
    const textColor = [0, 0, 0]; // Color del texto de los datos (negro)
  
    for (let i = 0; i < exportData.length; i++) {
      // Verificar si hay suficiente espacio en la página para el nuevo registro
      if (currentY + rowHeight > doc.internal.pageSize.height) {
        doc.addPage(); // Agregar nueva página si no hay suficiente espacio
        currentY = 30; // Reiniciar posición Y
      }
  
      const row = exportData[i];
      const startX = 14; // Posición X inicial
  
      // Escribir encabezados personalizados
      exportColumns.forEach(({ title, dataKey }, index) => {
        const value = row[dataKey]; // Obtener el valor correspondiente al encabezado
        // Encabezado
        doc.setFillColor(...headerColor);
        doc.rect(startX, currentY + (index * maxHeightPerColumn), 180, maxHeightPerColumn, 'F'); // Fondo del encabezado
        doc.setTextColor(255); // Color del texto del encabezado (blanco)
        doc.text(title, startX + 2, currentY + (index * maxHeightPerColumn) + 7); // Encabezado
        // Valor correspondiente
        doc.setTextColor(...textColor); // Restablecer el color del texto para los datos
        doc.text(`${value}`, startX + 90, currentY + (index * maxHeightPerColumn) + 7); // Valor correspondiente
      });
  
      currentY += rowHeight; // Espacio entre registros
    }
  
    // Guardar el PDF
    doc.save("Control Rendimiento Cosecha y Frass.pdf");
  };
  
  
  
  
  
  
  const exportXlsx = () => {
    if (selectedRegistros.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "No hay filas seleccionadas para exportar.",
        life: 3000,
      });
      return; // Detener la ejecución si no hay filas seleccionadas
    }
  
    const headers = cols.map(col => col.header); // Obtener encabezados
    const exportData = selectedRegistros.map(({ fec_registro, hor_registro, ...registro }) => ({
      ...registro,
      registrado: `${fec_registro || ""} ${hor_registro || ""}`, // Combina las fechas
    }));
  
    const rows = exportData.map(registro => cols.map(col => registro[col.field])); // Mapeo de filas
  
    const dataToExport = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(dataToExport);
  
    ws["!cols"] = cols.map(col => ({ width: Math.max(col.header.length, 10) })); // Ajustar ancho de columnas
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(wb, "Control Rendimiento Cosecha y Frass.xlsx");
  };
  
  // FIN Exportar a Excel y PDF

  return (
    <>
      <div className="controlrendcosechayfrass-container">
        <Toast ref={toast} />
        <h1>Control de Rendimiento Cosecha y Frass</h1>
        <div className="welcome-message">
          <p>
            Bienvenido al sistema de Control de Rendimiento Cosecha y Frass.
            Aquí puedes gestionar los registros de producción.
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
            <Column field="fec_registro" header="Fecha Registro"  sortable />
            <Column field="hor_registro" header="Hora Registro" sortable />
            <Column field="tipo_produccion" header="Tipo Producción" editor={(options) => textEditor(options)} sortable />
            <Column field="tipo_control" header="Tipo Control" editor={(options) => textEditor(options)} sortable />
            <Column field="fec_siembra" header="Fecha Siembra" editor={(options) => dateEditor(options)} sortable />
            <Column field="fec_cosecha" header="Fecha Cosecha" editor={(options) => dateEditor(options)} sortable />
            <Column
              field="cant_cajas_cosechadas"
              header="Cajas Cosechadas"
              sortable
              editor={(options) => numberEditor(options)}
            />
            <Column
              field="kg_larva_fresca"
              header="Larva Fresca (KG)"
              sortable
              editor={(options) => floatEditor(options)}
            />
            <Column
              field="cant_cajas_desechadas"
              header="Cajas Desechadas"
              sortable
                editor={(options) => numberEditor(options)}
            />
            <Column
              field="kg_larva_desechada"
              header="Larva Desechada Bloque (KG)"
              sortable
              editor={(options) => floatEditor(options)}
            />
            <Column
              field="kg_larva_desecho_limpia"
              header="Desecho Larva Limpia (KG)"
              sortable
              editor={(options) => floatEditor(options)}
            />
            <Column field="kg_total_frass" header="Total Frass (KG)" editor={(options) => floatEditor(options)} sortable />
            <Column
              field="kg_material_grueso"
              header="Material Grueso (KG)"
              sortable
              editor={(options) => floatEditor(options)}
            />
            <Column field="cant_sacos" header="Sacos" sortable />
            <Column
              field="fec_almacenaje_frass"
              header="Fecha Almacenaje Frass"
              sortable
              editor={(options) => dateEditor(options)}
            />
            <Column field="observaciones" header="Observaciones" sortable editor={(options) => textEditor(options)} />
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
          <label htmlFor="fec_siembra" className="font-bold">
            Fecha Registro{" "}
            {submitted && !registro.fec_siembra && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="date"
            id="fec_siembra"
            value={registro.fec_siembra}
            onChange={(e) => onInputChange(e, "fec_siembra")}
            required
            autoFocus
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
            autoFocus
          />
          <br />
          <label htmlFor="cant_cajas_cosechadas" className="font-bold">
            Cajas Cosechadas{" "}
            {submitted && !registro.cant_cajas_cosechadas && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="cant_cajas_cosechadas"
            value={registro.cant_cajas_cosechadas}
            onChange={(e) => onInputChange(e, "cant_cajas_cosechadas")}
            required
          />
          <br />
          <label htmlFor="kg_larva_fresca" className="font-bold">
            Larva Fresca Estandar (KG){" "}
            {submitted && !registro.kg_larva_fresca && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="kg_larva_fresca"
            value={registro.kg_larva_fresca}
            onChange={(e) => onInputChange(e, "kg_larva_fresca")}
            required
          />
          <br />
          <label htmlFor="cant_cajas_desechadas" className="font-bold">
            Cajas Desechadas{" "}
            {submitted && !registro.cant_cajas_desechadas && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="cant_cajas_desechadas"
            value={registro.cant_cajas_desechadas}
            onChange={(e) => onInputChange(e, "cant_cajas_desechadas")}
            required
          />
          <br />
          <label htmlFor="kg_larva_desechada" className="font-bold">
            Larva Desechada Bloque (KG){" "}
            {submitted && !registro.kg_larva_desechada && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="kg_larva_desechada"
            value={registro.kg_larva_desechada}
            onChange={(e) => onInputChange(e, "kg_larva_desechada")}
            required
          />
          <br />
          <label htmlFor="kg_larva_desecho_limpia" className="font-bold">
            Desecho Larva Limpia (KG){" "}
            {submitted && !registro.kg_larva_desecho_limpia && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="kg_larva_desecho_limpia"
            value={registro.kg_larva_desecho_limpia}
            onChange={(e) => onInputChange(e, "kg_larva_desecho_limpia")}
            required
          />
          <br />
          <label htmlFor="kg_total_frass" className="font-bold">
            Frass Fino Total (KG){" "}
            {submitted && !registro.kg_total_frass && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="kg_total_frass"
            value={registro.kg_total_frass}
            onChange={(e) => onInputChange(e, "kg_total_frass")}
            required
          />
          <br />
          <label htmlFor="kg_material_grueso" className="font-bold">
            Total Material Grueso (KG){" "}
            {submitted && !registro.kg_material_grueso && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="kg_material_grueso"
            value={registro.kg_material_grueso}
            onChange={(e) => onInputChange(e, "kg_material_grueso")}
            required
          />
          <br />
          <label htmlFor="tipo_control" className="font-bold">
            Tipo Control{" "}
            {submitted && !registro.tipo_control && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <Dropdown
            id="tipo_control"
            value={registro.tipo_control}
            options={tiposControl}
            onChange={(e) => onInputChange(e, "tipo_control")}
            placeholder="Selecciona un tipo"
            required
          />
          <br />

          <label htmlFor="tipo_produccion" className="font-bold">
            Tipo Producción{" "}
            {submitted && !registro.tipo_produccion && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <Dropdown
            id="tipo_produccion"
            value={registro.tipo_produccion}
            options={tiposProduccion}
            onChange={(e) => onInputChange(e, "tipo_produccion")}
            placeholder="Selecciona un tipo"
            required
          />
          <br />

          <label htmlFor="fec_almacenaje_frass" className="font-bold">
            Fecha Almacenaje Frass{" "}
            {submitted && !registro.fec_almacenaje_frass && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="date"
            id="fec_almacenaje_frass"
            value={registro.fec_almacenaje_frass}
            onChange={(e) => onInputChange(e, "fec_almacenaje_frass")}
            required
            autoFocus
          />
          <br />
          <label htmlFor="cant_sacos" className="font-bold">
            Cantidad Sacos{" "}
            {submitted && !registro.cant_sacos && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="cant_sacos"
            value={registro.cant_sacos}
            onChange={(e) => onInputChange(e, "cant_sacos")}
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
export default ControlRendimientoCosechayFrass;
