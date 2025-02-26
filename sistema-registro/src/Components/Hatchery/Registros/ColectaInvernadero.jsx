import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ColectaInvernadero.css"; //Estilos de la tabla
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

//OTROS
import * as XLSX from "xlsx";
import logo2 from "../../../assets/mosca.png";
import jsPDF from "jspdf";
import "jspdf-autotable";

function ColectaInvernadero() {
  //Variable de registro vacio
  let emptyRegister = {
    id: null,
    fec_colocacion: "",
    fec_salida_eggies: "",
    num_embudo: "",
    cantidad_eggies: "",
    mediana: "",
    total_gm: "",
    nave_procedencia: "",
    temp: "",
    hum_relativa: "",
    operario: "",
    observaciones: "",
  };

  const [eggies, seteggies] = useState([]); //Variable de estado que guarda los datos de la tabla Usuarios
  const [eggie, seteggie] = useState(emptyRegister); //Variable de estado que guarda los datos de un usuario

  const toast = useRef(null); //Variable de referencia para mostrar mensajes emergentes
  const dt = useRef(null); //Variable de referencia para la tabla
  const [selectedeggies, setSelectedeggies] = useState([]); //Variable de estado que guarda los usuarios seleccionados
  const [globalFilter, setGlobalFilter] = useState(null); //Variable de estado que guarda el filtro de busqueda
  const [submitted, setSubmitted] = useState(false); //Variable de estado que guarda si se ha enviado un formulario
  const [eggieDialog, seteggieDialog] = useState(false); //Variable de estado que guarda si se muestra el dialogo de usuario
  const [deleteeggieDialog, setDeleteeggieDialog] = useState(false); //Variable de estado que guarda si se muestra el dialogo de eliminar usuario
  const [deleteeggiesDialog, setDeleteeggiesDialog] = useState(false); //Variable de estado que guarda si se muestra el dialogo de eliminar usuarios
  const navigate = useNavigate(); //Variable de navegación
  const [selectedRegistros, setSelectedRegistros] = useState([]);
  const [observacionesObligatorio, setObservacionesObligatorio] =
    useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({
    num_embudo: false,
    cantidad_eggies: false,
    total_gm: false,
  });
  
  const convertirFecha = (fecha) =>
    fecha ? fecha.split("-").reverse().join("/") : "";

  //Inicio de FETCH REGISTROS
  const fetcheggies = async () => {
    //Funcion asyncrona para obtener los datos de la tabla Usuarios
    try {
      const { data, error } = await supabase
        .from("Eggies_Colecta_Invernadero_Embudo")
        .select(); //Constante de data y error que es un await, es decir espera a que reciba una respuesta de la variable supabase, de la tabla "Uusarios" y hace un select de toda la tabla
        if (error) throw error;
        // console.log(error ? "Error:" : "Datos:", error || data); //YUn console log que nos dice si hay un error o si se obtuvieron los datos
      seteggies(data || []); //Setea la variable Usuarios con los datos obtenidos o un array vacio si no se obtuvieron datos
    } catch {
      console.log("Error al obtener los datos de la tabla");
    }
  };

  useEffect(() => {
    //Este useEffect es un hook para que solo se ejecute una sola vez al cargar la pagina
    fetcheggies(); //Ejecuta la funcion fetchUsuarios que obtiene los datos de la tabla Usuarios
  }, []);
  //Fin de FETCH REGISTROS

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


  const cols = [

    { field: "id", header: "ID" },
    {field: "lote", header: "Lote"},
    { field: "fec_colocacion", header: "Fecha Colocación" },
    { field: "fec_salida_eggies", header: "Fecha Salida" },
    { field: "num_embudo", header: "# Embudo" },
    { field: "cantidad_eggies", header: "Cantidad Eggies" },
    { field: "mediana", header: "Mediana" },
    { field: "total_gm", header: "Total g" },
    { field: "nave_procedencia", header: "Procedencia" },
    { field: "temp", header: "Temperatura Ambiente" },
    { field: "hum_relativa", header: "Humedad relativa" },
    { field: "operario", header: "Operio" },
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
    
        doc.save("Colecta Invernadero.pdf");
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
        XLSX.writeFile(wb, "Colecta Invernadero.xlsx");
      };

  

  // Columnas de la tabla para exportar
  


  // Fin de EXPORTAR TABLA

  // //Inicio de EDITAR TABLA
  const onRowEditComplete = async (e) => {
    const { newData } = e; // Obtén los datos de la fila
    const { id } = newData; // Solo necesitamos el ID para identificar la fila

    try {
      const { error } = await supabase
        .from("Eggies_Colecta_Invernadero_Embudo")
        .update(newData) // Usamos directamente el nuevo dato
        .eq("id", id);

      if (error) {
        console.error("Error al actualizar:", error.message);
        return;
      }

      // Actualizar solo la fila editada en el estado
      seteggies((prevEggie) =>
        prevEggie.map((eggie) =>
          eggie.id === id ? { ...eggie, ...newData } : eggie
        )
      );
    } catch (err) {
      console.error("Error inesperado:", err);
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

  const saveeggie = async () => {
    setSubmitted(true);

    // Validar los campos
    const isNumEmbudoInvalido = eggie.num_embudo < 1 || eggie.num_embudo > 10;
    const isCantidadEggiesInvalido =
      eggie.cantidad_eggies < 500 || eggie.cantidad_eggies > 1500;
    const isTotalGmInvalido = eggie.total_gm < 1500 || eggie.total_gm > 5000;

    // Actualizar el estado de errores
    setErroresValidacion({
      num_embudo: isNumEmbudoInvalido,
      cantidad_eggies: isCantidadEggiesInvalido,
      total_gm: isTotalGmInvalido,
    });

    // Verificar si hay algún valor fuera de rango
    const valoresFueraDeRango =
      isNumEmbudoInvalido || isCantidadEggiesInvalido || isTotalGmInvalido;
    if (
      !eggie.fec_colocacion ||
      !eggie.fec_salida_eggies ||
      !eggie.num_embudo ||
      !eggie.cantidad_eggies ||
      !eggie.mediana ||
      !eggie.total_gm ||
      !eggie.nave_procedencia ||
      !eggie.temp ||
      !eggie.hum_relativa ||
      !eggie.operario
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
    if (valoresFueraDeRango && !eggie.observaciones) {
      setObservacionesObligatorio(true);
      const currentErrores = {
        "Número de Embudo": isNumEmbudoInvalido,
        "Cantidad de Eggies": isCantidadEggiesInvalido,
        "Total Gramos": isTotalGmInvalido,
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
      num_embudo: false,
      cantidad_eggies: false,
      total_gm: false,
    });
    try {
      const currentDate = formatDateTime(new Date(), "DD/MM/YYYY"); // Fecha actual
      const currentTime = formatDateTime(new Date(), "hh:mm A"); // Hora actual
const { data, error } = await supabase
        .from("Eggies_Colecta_Invernadero_Embudo")
        .insert([
          {
            fec_colocacion: convertirFecha(eggie.fec_colocacion),
            fec_salida_eggies: convertirFecha(eggie.fec_salida_eggies),
            num_embudo: eggie.num_embudo,
            cantidad_eggies: eggie.cantidad_eggies,
            mediana: eggie.mediana,
            total_gm: eggie.total_gm,
            nave_procedencia: eggie.nave_procedencia,
            temp: eggie.temp,
            hum_relativa: eggie.hum_relativa,
            operario: eggie.operario,
            fec_registro: currentDate,
            hor_registro: currentTime,
            observaciones: eggie.observaciones,
          },
        ]);
      if (error) {
        console.error("Error en Supabase:", error);
        throw new Error(
          error.message || "Error desconocido al guardar en Supabase"
        );
      }
      // console.log("Datos insertados:", data);
      toast.current.show({
        severity: "success",
        summary: "Exitoso",
        detail: "Registro guardado exitosamente",
        life: 3000,
      });
      // Limpia el estado
      seteggie(emptyRegister);
      seteggieDialog(false);
      setSubmitted(false);
      fetcheggies();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Ocurrió un error al crear el usuario",
        life: 3000,
      });
    }
  };

  const onInputChange = (e, name) => {
    // Obtener el valor dependiendo del tipo de input
    let val = e.target.value;
    // Si el valor proviene de un input type="number", debemos asegurarnos de convertirlo a número.
    if (e.target.type === "number") {
      val = val ? parseInt(val, 10) : ""; // Si no es un número, se lo dejamos vacío o le asignamos un valor numérico como 0.
    }
    // Crear una copia del estado del usuario
    let _eggie = { ...eggie };
    // Actualizar el valor de la propiedad correspondiente
    _eggie[`${name}`] = val;
    // Actualizar el estado del usuario
    seteggie(_eggie);
  };

  // //Inicio de DIALOGO DE REGISTRO
  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="New"
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
          //disabled={selectedeggies.length === 0}
        />

        <Button
          label="Exportar a PDF"
          icon="pi pi-file-pdf"
          className="p-button-danger"
          onClick={exportPdf}
          //disabled={selectedeggies.length === 0}
        />
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      {/* <h4 className="m-0">Ingreso PP Invernadero</h4> */}
      <IconField iconPosition="left">
        {/* <InputIcon className="pi pi-search" /> */}
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscador Global..."
        />
      </IconField>
    </div>
  );

  const openNew = () => {
    seteggie(emptyRegister);
    setSubmitted(false);
    seteggieDialog(true);
  };
  const hideDialog = () => {
    setSubmitted(false);
    seteggieDialog(false);
  };

  const eggieDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" onClick={saveeggie} />
    </React.Fragment>
  );

  // //Fin de DIALOGO DE REGISTRO

  return (
    <>
      <div className="tabla-container">
        <Toast ref={toast} />
        <h1>
          <img src={logo2} alt="mosca" className="logo2" />
          Colecta Eggies Invernadero - Embudos
        </h1>
        <div className="welcome-message">
          <p>
            Bienvenido al sistema de Colecta de Eggies. Aquí puedes gestionar
            los registros de cosecha se eggies del invernadero - embudo.
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
            editMode="row"
            onRowEditComplete={onRowEditComplete}
            ref={dt}
            value={eggies}
            selection={selectedeggies}
            onSelectionChange={(e) => setSelectedeggies(e.value)}
            onRowEditInit={(e) => seteggie(e.data)}
            className="p-datatable-gridlines tabla"
            style={{ width: "100%" }}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Usuarios"
            globalFilter={globalFilter}
            header={header}
          >
            <Column selectionMode="multiple" exportable={false}></Column>
            <Column
              field="id"
              header="ID"
              sortable
              style={{ minWidth: "3rem" }}
            ></Column>
            <Column
              field="fec_colocacion"
              header="Colocación"
              editor={(options) => dateEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="fec_salida_eggies"
              header="Salida"
              editor={(options) => dateEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="num_embudo"
              header="Embudo"
              editor={(options) => numberEditor(options)}
              sortable
              style={{ minWidth: "8rem" }}
            ></Column>
            <Column
              field="cantidad_eggies"
              header="Cantidad Eggies"
              editor={(options) => numberEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="mediana"
              header="Mediana"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="total_gm"
              header="Total g"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "8rem" }}
            ></Column>
            <Column
              field="nave_procedencia"
              header="Procedencia"
              editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="temp"
              header="Temperatura"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="hum_relativa"
              header="Humedad Relativa"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "11rem" }}
            ></Column>
            <Column
              field="operario"
              header="Operario"
              // editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "14rem" }}
            ></Column>
            <Column
              field="fec_registro"
              header="Fecha Registro"
              // editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "14rem" }}
            ></Column>
            <Column
              field="hor_registro"
              header="Hora Registro"
              // editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "14rem" }}
            ></Column>
            <Column
              field="observaciones"
              header="Observaciones"
              editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "8rem" }}
            ></Column>
            <Column
              field="lote_id"
              header="Lote"
              // editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "8rem" }}
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
        visible={eggieDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Nuevo Registro"
        modal
        className="p-fluid"
        footer={eggieDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="fec_colocacion" className="font-bold">
            Fecha Colocación{" "}
            {submitted && !eggie.fec_colocacion && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="date"
            id="fec_colocacion"
            value={eggie.fec_colocacion}
            onChange={(e) => onInputChange(e, "fec_colocacion")}
            required
            autoFocus
          />
          <br />

          <label htmlFor="fec_salida_eggies" className="font-bold">
            Fecha Salida Eggies{" "}
            {submitted && !eggie.fec_salida_eggies && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="date"
            id="fec_salida_eggies"
            value={eggie.fec_salida_eggies}
            onChange={(e) => onInputChange(e, "fec_salida_eggies")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="num_embudo" className="font-bold">
            # Embudo{" "}
            {submitted && !eggie.num_embudo && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.num_embudo && (
              <small className="p-error">
                Número de Embudo debe de ser del 1 al 10.
              </small>
            )}
          </label>
          <InputText
            type="number"
            id="num_embudo"
            value={eggie.num_embudo}
            onChange={(e) => onInputChange(e, "num_embudo")}
            required
            autoFocus
          />
          <br />
          <label htmlFor="cantidad_eggies" className="font-bold">
            Cantidad Eggies{" "}
            {submitted && !eggie.cantidad_eggies && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.cantidad_eggies && (
              <small className="p-error">
                Cantidad de Eggies debe de estar entre 500 a 1500.
              </small>
            )}
          </label>
          <InputText
            type="number"
            id="cantidad_eggies"
            value={eggie.cantidad_eggies}
            onChange={(e) => onInputChange(e, "cantidad_eggies")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="mediana" className="font-bold">
            Mediana{" "}
            {submitted && !eggie.mediana && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="mediana"
            value={eggie.mediana}
            onChange={(e) => onInputChange(e, "mediana")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="total_gm" className="font-bold">
            Total g{" "}
            {submitted && !eggie.total_gm && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.total_gm && (
              <small className="p-error">
                Total de Gramos debe de estar entre 1500 a 5000.
              </small>
            )}
          </label>
          <InputText
            type="float"
            id="total_gm"
            value={eggie.total_gm}
            onChange={(e) => onInputChange(e, "total_gm")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="nave_procedencia" className="font-bold">
            Nave / Procedencia{" "}
            {submitted && !eggie.nave_procedencia && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            id="nave_procedencia"
            value={eggie.nave_procedencia}
            onChange={(e) => onInputChange(e, "nave_procedencia")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="temp" className="font-bold">
            Temperatura{" "}
            {submitted && !eggie.temp && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="temp"
            value={eggie.temp}
            onChange={(e) => onInputChange(e, "temp")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="hum_relativa" className="font-bold">
            Humedad Relativa{" "}
            {submitted && !eggie.hum_relativa && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            id="hum_relativa"
            value={eggie.hum_relativa}
            onChange={(e) => onInputChange(e, "hum_relativa")}
            required
            autoFocus
          />
          <br />
          <label htmlFor="operario" className="font-bold">
            Operario{" "}
            {submitted && !eggie.operario && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            id="operario"
            value={eggie.operario}
            onChange={(e) => onInputChange(e, "operario")}
            required
            autoFocus
          />
          <label htmlFor="observaciones" className="font-bold">
            Observaciones{" "}
            {observacionesObligatorio && (
              <small className="p-error">Requerido por fuera de rango.</small>
            )}
          </label>
          <InputText
            id="observaciones"
            value={eggie.observaciones}
            onChange={(e) => onInputChange(e, "observaciones")}
            required
            autoFocus
          />
        </div>
      </Dialog>
    </>
  );
}
export default ColectaInvernadero;
