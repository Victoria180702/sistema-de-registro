import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ControlRendimientoProductoTerminado.css"; // Importa el CSS
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
import { Divider } from "primereact/divider";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo2 from "../../../assets/mosca.png";

const ControlRendimientoProductoTerminado = () => {

    let emptyRegister = {
        fecha_produccion: "",
        hora: "",
        lote: "",
        cant_bolsas: "",
        SKU: "",
        operario: "",
        fecha_registro: "",
        hora_registro: "",
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
        const navigate = useNavigate();

        const convertirFecha = (fecha) =>
            fecha ? fecha.split("-").reverse().join("/") : "";
        
          const fetchRegistros = async () => {
            try {
              const { data, error } = await supabase.from("Control_Rendimiento_Producto_Terminado").select();
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
            if (
                !registro.fecha_produccion ||
                !registro.hora ||
                !registro.lote ||
                !registro.cant_bolsas ||
                !registro.SKU ||
                !registro.operario
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
        
              const { data, error } = await supabase.from("Control_Rendimiento_Producto_Terminado").insert([
                {
                    fecha_produccion: convertirFecha(registro.fecha_produccion),
                    hora: registro.hora,
                    lote: registro.lote,
                    cant_bolsas: registro.cant_bolsas,
                    SKU: registro.SKU,
                    operario: registro.operario,
                    fecha_registro: currentDate,
                    hora_registro: currentTime,
                    observaciones: registro.observaciones,
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
        
          const checkboxEditor = (options) => {
            return (
              <input
                type="checkbox"
                checked={options.value}
                onChange={(e) => options.editorCallback(e.target.checked)}
              />
            );
          };
        
          const dropdownEditor = (options) => {
            return (
              <select
                value={options.value}
                onChange={(e) => options.editorCallback(e.target.value)}
              >
                {options.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          };
        
          const allowEdit = (rowData) => {
            return rowData.name !== "Blue Band";
          };
        
          const onRowEditComplete = async ({ newData }) => {
            const { id, ...updatedData } = newData;
            try {
              const { error } = await supabase
                .from("Control_Neonatos")
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
            { field: "fecha_produccion", header: "Fecha Producción" },
            { field: "hora", header: "Hora" },
            { field: "lote", header: "Lote" },
            { field: "cant_bolsas", header: "Cantidad Bolsas" },
            { field: "SKU", header: "SKU" },
            { field: "operario", header: "Operario" },

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
            doc.text("Registros de Control Rendimiento Producto Terminado", 14, 22);
        
            const exportData = selectedRegistros.map(
              ({ fecha_registro, hora_registro, ...row }) => ({
                ...row,
                registrado: `${fecha_registro || ""} ${hora_registro || ""}`,
              })
            );
        
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
                doc.rect(
                  startX,
                  currentY + index * maxHeightPerColumn,
                  180,
                  maxHeightPerColumn,
                  "F"
                );
                doc.setTextColor(255);
                doc.text(title, startX + 2, currentY + index * maxHeightPerColumn + 7);
                doc.setTextColor(...textColor);
                doc.text(
                  `${value}`,
                  startX + 90,
                  currentY + index * maxHeightPerColumn + 7
                );
              });
        
              currentY += rowHeight;
            }
        
            doc.save("Control Rendimiento Producto Terminado.pdf");
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
        
            const headers = cols.map((col) => col.header);
            const exportData = selectedRegistros.map(
              ({ fecha_registro, hora_registro, ...registro }) => ({
                ...registro,
                registrado: `${fecha_registro || ""} ${hora_registro || ""}`,
              })
            );
        
            const rows = exportData.map((registro) =>
              cols.map((col) => registro[col.field])
            );
        
            const dataToExport = [headers, ...rows];
            const ws = XLSX.utils.aoa_to_sheet(dataToExport);
        
            ws["!cols"] = cols.map((col) => ({
              width: Math.max(col.header.length, 10),
            }));
        
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Registros");
            XLSX.writeFile(wb, "Control Rendimiento Producto Terminado.xlsx");
          };
        
          return (
            <>
              <div className="controltiempos-container">
                <Toast ref={toast} />
                <h1>         
                  <img src={logo2} alt="mosca" className="logo2" />
                  Control de Rendimiento Producto Terminado
                </h1>
                <div className="welcome-message">
                  <p>
                    Bienvenido al sistema de Calidad Rendimiento Producto Terminado. Aquí puedes
                    gestionar los registros de Producto Terminado.
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
                <Column
                    field="fecha_produccion"
                    header="Fecha Producción"
                    editor={(options) => dateEditor(options)}
                ></Column>
                <Column
                    field="hora"
                    header="Hora"
                    editor={(options) => timeEditor(options)}
                ></Column>
                <Column
                    field="lote"
                    header="Lote"
                    editor={(options) => textEditor(options)}
                ></Column>
                <Column
                    field="cant_bolsas"
                    header="Cantidad Bolsas"
                    editor={(options) => numberEditor(options)}
                ></Column>
                <Column
                    field="SKU"
                    header="SKU"
                ></Column>
                <Column
                    field="operario"
                    header="Operario"
                    editor={(options) => textEditor(options)}
                ></Column>
                    <Column
                      field="observaciones"
                      header="Observaciones"
                      editor={(options) => textEditor(options)}
                    ></Column>
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
                <div className="p-field">
                  <label htmlFor="fecha_produccion" className="font-bold">
                    Fecha de Produccion{" "}
                    {submitted && !registro.fecha_produccion && (
                      <small className="p-error">Requerido.</small>
                    )}
                  </label>
                  <InputText
                  type="date"
                    id="fecha_produccion"
                    value={registro.fecha_produccion}
                    onChange={(e) => onInputChange(e, "fecha_produccion")}
                  />
        
                  <br />
        
                  <label htmlFor="hora" className="font-bold">
                    Hora{" "}
                    {submitted && !registro.hora && (
                      <small className="p-error">Requerido.</small>
                    )}
                  </label>
                  <InputText
                    type="time"
                    id="hora"
                    value={registro.hora}
                    onChange={(e) => onInputChange(e, "hora")}
                  />
        
                  <br />
        
                  <label htmlFor="lote" className="font-bold">
                    Lote{" "}
                    {submitted && !registro.lote && (
                      <small className="p-error">Requerido.</small>
                    )}
                  </label>
                  <InputText
                    id="lote"
                    value={registro.lote}
                    onChange={(e) => onInputChange(e, "lote")}
                  />
        
                  <br />
        
                  <label htmlFor="cant_bolsas" className="font-bold">
                    Cantidad Bolsas{" "}
                    {submitted && !registro.cant_bolsas && (
                      <small className="p-error">Requerido.</small>
                    )}
                  </label>
                  <InputText
                    type="number"
                    id="cant_bolsas"
                    value={registro.cant_bolsas}
                    onChange={(e) => onInputChange(e, "cant_bolsas")}
                  />
        
                  <br />
        
                  <label htmlFor="SKU" className="font-bold">
                    SKU{" "}
                    {submitted && !registro.SKU && (
                      <small className="p-error">Requerido.</small>
                    )}
                  </label>
                  <InputText
                    id="SKU"
                    value={registro.SKU}
                    onChange={(e) => onInputChange(e, "SKU")}
                  />
        
                  <br />
        
                  <label htmlFor="operario" className="font-bold">
                    Operario{" "}
                    {submitted && !registro.operario && (
                      <small className="p-error">Requerido.</small>
                    )}
                  </label>
                  <InputText
                    id="operario"
                    value={registro.operario}
                    onChange={(e) => onInputChange(e, "operario")}
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
export default ControlRendimientoProductoTerminado;