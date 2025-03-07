import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Imports de estilos
import logo2 from "../../../assets/mosca.png";
import "./ControlRendimientoCosechayFrass.css";

// Imports de Supabase
import supabase from "../../../supabaseClient";

// PRIME REACT
import "primereact/resources/themes/bootstrap4-light-blue/theme.css"; //theme
import "primeicons/primeicons.css"; //icons

// PRIME REACT COMPONENTS
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

// Imports de exportar
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
  const [outOfRange, setOutOfRange] = useState(false); // Estado para controlar si algún valor está fuera de rango
  const navigate = useNavigate();

  //Errores de validación
      const [observacionesObligatorio, setObservacionesObligatorio] =
        useState(false);
      const [erroresValidacion, setErroresValidacion] = useState({
        cant_cajas_cosechadas: false, 
      kg_larva_fresca: false,
      cant_cajas_desechadas: false, //Si es mayor a 0
      kg_total_frass: false,
      kg_material_grueso: false,
      });

  const convertirFecha = (fecha) =>
    fecha ? fecha.split("-").reverse().join("/") : "";

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
    const isCantCajasCosechadasInvalido =
      registro.cant_cajas_cosechadas < 500 || registro.cant_cajas_cosechadas > 2000;
    const isKgLarvaFrescaInvalido =
      registro.kg_larva_fresca < 0 || registro.kg_larva_fresca > 12000;
    const isCantCajasDesechadasInvalido = registro.cant_cajas_desechadas === 0;
    const isKgTotalFrassInvalido =
      registro.kg_total_frass < 0 || registro.kg_total_frass > 6000;
    const isKgMaterialGruesoInvalido =
      registro.kg_material_grueso < 0 || registro.kg_material_grueso > 6000;
  
    // Actualizar el estado de errores
    const erroresValidacion = {
      cant_cajas_cosechadas: isCantCajasCosechadasInvalido,
      kg_larva_fresca: isKgLarvaFrescaInvalido,
      cant_cajas_desechadas: isCantCajasDesechadasInvalido,
      kg_total_frass: isKgTotalFrassInvalido,
      kg_material_grueso: isKgMaterialGruesoInvalido,
    };
  
    // Verificar si algún valor está fuera de rango
    const valoresFueraDeRango = Object.values(erroresValidacion).some(
      (error) => error
    );
  
    // Validación principal
    if (
      !registro.fec_siembra ||
      !registro.fec_cosecha ||
      !registro.cant_cajas_cosechadas ||
      !registro.kg_larva_fresca ||
      !registro.cant_cajas_desechadas ||
      !registro.kg_total_frass ||
      !registro.kg_material_grueso ||
      !registro.tipo_control ||
      !registro.tipo_produccion ||
      !registro.fec_almacenaje_frass ||
      !registro.cant_sacos
    ) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Llena todos los campos obligatorios.",
        life: 3000,
      });
      return;
    }
  
    // Si algún valor está fuera de rango y no hay observaciones, mostrar error
    if (valoresFueraDeRango && !registro.observaciones) {
      const camposInvalidos = Object.keys(erroresValidacion)
        .filter((key) => erroresValidacion[key])
        .map((key) => {
          switch (key) {
            case "cant_cajas_cosechadas":
              return "Cajas Cosechadas (500 - 2000)";
            case "kg_larva_fresca":
              return "Larva Fresca (0 - 12000 KG)";
            case "cant_cajas_desechadas":
              return "Cajas Desechadas (debe ser 0)";
            case "kg_total_frass":
              return "Frass Fino Total (0 - 6000 KG)";
            case "kg_material_grueso":
              return "Material Grueso (0 - 6000 KG)";
            default:
              return "";
          }
        })
        .join(", ");
  
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Debe agregar observaciones. Campos inválidos: ${camposInvalidos}`,
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
            fec_siembra: registro.fec_siembra,
            fec_cosecha: registro.fec_cosecha,
            cant_cajas_cosechadas: registro.cant_cajas_cosechadas,
            kg_larva_fresca: registro.kg_larva_fresca,
            cant_cajas_desechadas: registro.cant_cajas_desechadas,
            kg_total_frass: registro.kg_total_frass,
            kg_material_grueso: registro.kg_material_grueso,
            fec_registro: currentDate,
            hor_registro: currentTime,
            observaciones: registro.observaciones,
            fec_almacenaje_frass: registro.fec_almacenaje_frass,
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
      <Button 
      label="Guardar" 
      icon="pi pi-check" 
      onClick={saveRegistro} />
    </React.Fragment>
  );

  const cols = [
    { field: "tipo_produccion", header: "Tipo Producción" },
    { field: "tipo_control", header: "Tipo Control" },
    { field: "fec_siembra", header: "Fecha Siembra" },
    { field: "fec_cosecha", header: "Fecha Cosecha" },
    { field: "cant_cajas_cosechadas", header: "Cajas Cosechadas" },
    { field: "kg_larva_fresca", header: "Larva Fresca (KG)" },
    { field: "cant_cajas_desechadas", header: "Cajas Desechadas" },
    { field: "kg_total_frass", header: "Total Frass (KG)" },
    { field: "kg_material_grueso", header: "Material Grueso (KG)" },
    { field: "cant_sacos", header: "Sacos" },
    { field: "fec_almacenaje_frass", header: "Fecha Almacenaje Frass" },
    { field: "observaciones", header: "Observaciones" },
    { field: "registrado", header: "Registrado" },
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
    XLSX.writeFile(wb, "Control Rendimiento Cosecha y Frass.xlsx");
  };

  return (
    <>
      <div className="controlrendcosechayfrass-container">
        <Toast ref={toast} />
        <h1>
          <img src={logo2} alt="mosca" className="logo2" />
          Control de Rendimiento Cosecha y Frass
        </h1>
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
            <Column field="fec_registro" header="Fecha Registro" sortable />
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
            Fecha Siembra{" "}
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
            Cajas Cosechadas (500 - 2000){" "}
            {submitted && !registro.cant_cajas_cosechadas && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.cant_cajas_cosechadas && (
              <small className="p-error">
                Cantidad Cajas Procesadas Fuera de rango 500 a 2000.
              </small>
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
            Larva Fresca Estandar (KG) (0 - 12000){" "}
            {submitted && !registro.kg_larva_fresca && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.kg_larva_fresca && (
              <small className="p-error">
                Kg Larva Fresca fuera de rango 0 a 12000.
              </small>
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
            Cajas Desechadas (=0){" "}
            {submitted && !registro.cant_cajas_desechadas && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.cant_cajas_desechadas && (
              <small className="p-error">
                Kg Larva Fresca fuera de rango 0 a 12000.
              </small>
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
          <label htmlFor="kg_total_frass" className="font-bold">
            Frass Fino Total (KG) (0 - 6000){" "}
            {submitted && !registro.kg_total_frass && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.kg_total_frass && (
              <small className="p-error">
                Kg Total Frass Fuera de rango 0 a 6000.
              </small>
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
            Total Material Grueso (KG) (0 - 6000){" "}
            {submitted && !registro.kg_material_grueso && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.kg_material_grueso && (
              <small className="p-error">
                Kg Material Grueso Fuera de rango 0 a 6000.
              </small>
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

export default ControlRendimientoCosechayFrass;