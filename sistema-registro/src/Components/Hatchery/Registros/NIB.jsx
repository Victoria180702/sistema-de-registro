import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

//Imports de estilos
import logo2 from "../../../assets/mosca.png";
import "./NIB.css"; 

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


function NIB() {

  //Variable de registro vacio
  let emptyRegister = {
    id: null,
    embudo: "",
    gm_colectados: "",
    cajas_inoculadas_destino: "",
    gm_neonato_caja: "",
    cantidad_dieta_caja: "",
    temp_ambiental: "",
    hum_ambiental: "",
    operario: "",
    fec_colecta: "",
    hor_colecta: "",
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
  //Errores de validación
  const [observacionesObligatorio, setObservacionesObligatorio] =
    useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({
    embudo: false,
    gm_colectados: false,
    cajas_inoculadas_destino: false,
  });

  //Lote Variables
  const [lotes, setLotes] = useState([]); // Estado para almacenar los lote_ids disponibles

  
  //Inicio de FETCH REGISTROS
  const fetchNeonatos = async () => {
    try {
      const { data, error } = await supabase
        .from("Neonatos_Inoculados")
        .select(); // Solo seleccionamos el campo lote_id
      if (error) throw error; // Si hay un error, lanzamos una excepción
      setRegistros(data || []); // Guardamos los datos obtenidos en el estado
    } catch (err) {
      console.log("Error en la conexión a la base de datos", err);
    }
  };
//Fin de FETCH REGISTROS

//Inicio de FETCH LOTES
  const fetchLotes = async () => {
    try {
      const { data, error } = await supabase
        .from("Neonatos_Inoculados")
        .select("lote_id"); // Solo traemos el lote_id

      if (error) throw error;

      // Eliminar duplicados, ordenar y formatear
      const loteIds = [...new Set(data.map((item) => item.lote_id))] // Elimina duplicados
        .sort((a, b) => a - b) // Ordena de manera ascendente
        .map((lote) => ({ label: lote, value: lote })); // Formatea para el dropdown

      setLotes(loteIds); // Guardamos los lotes en el estado
    } catch (err) {
      console.log("Error obteniendo lotes:", err);
    }
  };
  //Fin de FETCH LOTES

  // Este useEffect se ejecuta cuando el componente se monta, para obtener los datos una vez
  useEffect(() => {
    fetchNeonatos(); 
    fetchLotes(); 
  }, []); // Agrega globalFilter como dependencia
  // El array vacío asegura que solo se ejecute una vez cuando el componente se monta

  useEffect(() => { //Si se actualiza neonatos se ejecuta el useEffect osea se imprime en consola
    console.log("Neonatos actualizados: ", registros); 
  }, [registros]); 

  //Fin de FETCH REGISTROS


  const saveNeonatoInoculado = async () => {
    setSubmitted(true);

    // Validar los campos
    const isEmbudoInvalido = registro.embudo < 1 || registro.embudo > 10;
    // const isGmColectadosInvalido = neonato.gm_colectados < 1 || neonato.gm_colectados > 100;
    const isCajasInoculadasDestinoInvalido =
    registro.cajas_inoculadas_destino < 100 ||
    registro.cajas_inoculadas_destino > 500;
    // POR SI LO PIDEN MAS ADELANTE const isGmNeonatoCajaInvalido = neonato.gm_neonato_caja < 1 || neonato.gm_neonato_caja > 100;

    // Actualizar el estado de errores
    setErroresValidacion({
      embudo: isEmbudoInvalido,
      // gm_colectados: false,
      cajas_inoculadas_destino: isCajasInoculadasDestinoInvalido,
    });
    const valoresFueraDeRango =
      isEmbudoInvalido ||
      // isGmColectadosInvalido ||
      isCajasInoculadasDestinoInvalido;

    if (
      !registro.embudo ||
      !registro.gm_colectados ||
      !registro.cajas_inoculadas_destino ||
      !registro.gm_neonato_caja ||
      !registro.cantidad_dieta_caja ||
      !registro.temp_ambiental ||
      !registro.hum_ambiental ||
      !registro.operario
    ) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Llena todos los campos ",
        life: 3000,
      });
      return;
    }

    // Validación principal
    if (valoresFueraDeRango && !registro.observaciones) {
      setObservacionesObligatorio(true);
      const currentErrores = {
        "Número de Embudo": isEmbudoInvalido,
        // gm_colectados: false,
        "Cajas Inoculadas": isCajasInoculadasDestinoInvalido,
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
      embudo: false,
      // gm_colectados: false,
      cajas_inoculadas_destino: false,
    });

    try {
      // Convertir fec_cam_camas al formato dd/mm/yyyy
      // const formattedFecCamCamas = neonato.fec_cam_camas
      // ? new Date(neonato.fec_cam_camas).toISOString().split("T")[0].split("-").reverse().join("/")
      // : null;

      // const formattedFecIngresoPP = neonato.fec_ingreso_pp
      //   ? new Date(neonato.fec_ingreso_pp).toISOString().split("T")[0].split("-").reverse().join("/")
      //   : null;

      const currentDate = formatDateTime(new Date(), "DD/MM/YYYY"); // Solo fecha
      const currentTime = formatDateTime(new Date(), "hh:mm A"); // Fecha en formato ISO 8601
      const { data, error } = await supabase
        .from("Neonatos_Inoculados")
        .insert([
          {
            embudo: registro.embudo,
            gm_colectados: registro.gm_colectados,
            cajas_inoculadas_destino: registro.cajas_inoculadas_destino,
            gm_neonato_caja: registro.gm_neonato_caja,
            cantidad_dieta_caja: registro.cantidad_dieta_caja,
            temp_ambiental: registro.temp_ambiental,
            hum_ambiental: registro.hum_ambiental,
            operario: registro.operario,
            fec_colecta: currentDate,
            hor_colecta: currentTime,
            observaciones: registro.observaciones,
            lote_id: registro.lote_id,
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
      setRegistro(emptyRegister);
      setRegistroDialog(false);
      setSubmitted(false);
      fetchNeonatos();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Ocurrió un error al crear el usuario",
        life: 3000,
      });
    }
  };
  

  //Inicio Formatear la FECHA DE REGISTRO

  const convertirFecha = (fecha) =>
    fecha ? fecha.split("-").reverse().join("/") : "";

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

  
  

  // //Inicio de EDITAR TABLA
  
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
        .from("Neoantos_Inoculados")
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
      <Button label="Guardar" icon="pi pi-check" onClick={saveNeonatoInoculado} />
    </React.Fragment>
  );

  //FIN DE EDITAR TABLA

  

  //Inicio de EXPORTAR TABLA

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
      doc.text("Registros de Neonatos Inoculados", 14, 22);
  
      const exportData = selectedRegistros.map(
        ({ fec_colecta, hor_colecta, ...row }) => ({
          ...row,
          registrado: `${fec_colecta || ""} ${hor_colecta || ""}`,
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
  
      doc.save("Neonatos Inoculados.pdf");
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
        ({ fec_colecta, hor_colecta, ...registro }) => ({
          ...registro,
          registrado: `${fec_colecta || ""} ${hor_colecta || ""}`,
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
      XLSX.writeFile(wb, "Neonatos Inoculados.xlsx");
    };

  // Columnas de la tabla para exportar
  const cols = [
    { header: "ID", field: "id" },
    { header: "# Embudo", field: "embudo" },
    { header: "g Colectados", field: "gm_colectados" },
    { header: "Cajas Inoculadas / Destino", field: "cajas_inoculadas_destino" },
    { header: "g Neonato x Caja", field: "gm_neonato_caja" },
    { header: "Cantidad dieta x caja", field: "cantidad_dieta_caja" },
    { header: "Temperatura ambiental", field: "temp_ambiental" },
    { header: "Humedad ambiental", field: "hum_ambiental" },
    { header: "Operario", field: "operario" },
    { field: "observaciones", header: "Observaciones" },
    { field: "registrado", header: "Registrado" },
  ];

  // Mapeo de columnas para jsPDF-Autotable
  const exportColumns = cols.map((col) => ({
    title: col.header, // Título del encabezado
    dataKey: col.field, // Llave de datos
  }));

  // Fin de EXPORTAR TABLA

  return (
    <>
      <div className="tabla-container">
        <Toast ref={toast} />
        <h1>
          <img src={logo2} alt="mosca" className="logo2" />
          Neonatos Inoculados
        </h1>
        <div className="welcome-message">
          <p>
            Bienvenido al sistema de Neonatos Inoculados. Aquí puedes gestionar
            los registros de Neonatos Inoculados.
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
            onRowEditInit={(e) => setRegistro(e.data)}
            onRowEditCancel={(e) => console.log(e)}
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
              field="fec_colecta"
              header="Fecha Colecta"
              // editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="hor_colecta"
              header="Hora Colecta"
              // editor={(options) => dateEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="embudo"
              header="# Embudo"
              editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "8rem" }}
            ></Column>
            <Column
              field="gm_colectados"
              header="g Colectados"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="cajas_inoculadas_destino"
              header="Cajas Inoculadas / Destino"
              editor={(options) => numberEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="gm_neonato_caja"
              header="g Neonato x Caja"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "8rem" }}
            ></Column>
            <Column
              field="cantidad_dieta_caja"
              header="Cantidad dieta x caja"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="temp_ambiental"
              header="Temperatura ambiental"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="hum_ambiental"
              header="Humedad ambiental"
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
        visible={registroDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Nuevo Registro"
        modal
        className="p-fluid"
        footer={registroDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="lote_id" className="font-bold">
            Lote{" "}
            {submitted && !registro.lote_id && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <Dropdown
            value={registro.lote_id}
            onChange={(e) => setRegistro({ ...registro, lote_id: e.value })} // Actualiza el estado con el lote_id seleccionado
            options={lotes} // Los lote_ids disponibles
            optionLabel="label" // El valor a mostrar en el dropdown (lote_id)
            optionValue="value" // El valor real que se selecciona
            placeholder="Selecciona un lote"
            className="w-full md:w-14rem"
          />
          <br />
          <label htmlFor="embudo" className="font-bold">
            # de Embudo{" "}
            {submitted && !registro.embudo && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.embudo && (
              <small className="p-error">
                Número de Embudo debe de ser del 1 al 10.
              </small>
            )}
          </label>
          <InputText
            type="number"
            id="embudo"
            value={registro.embudo}
            onChange={(e) => onInputChange(e, "embudo")}
            required
            autoFocus
          />
          <br />

          <label htmlFor="gm_colectados" className="font-bold">
            g Colectados{" "}
            {submitted && !registro.gm_colectados && (
              <small className="p-error">Requerido.</small>
            )}
            {/* {erroresValidacion.gm_colectados && (
              <small className="p-error">
                Gramos Colectados depende de cada caja.
              </small>
            )} */}
          </label>
          <InputText
            type="float"
            id="gm_colectados"
            value={registro.gm_colectados}
            onChange={(e) => onInputChange(e, "gm_colectados")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="cajas_inoculadas_destino" className="font-bold">
            Cajas Inoculadas / Destido{" "}
            {submitted && !registro.cajas_inoculadas_destino && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.cajas_inoculadas_destino && (
              <small className="p-error">
                Cajas Inoculadas deben de estar entre 100 a 500.
              </small>
            )}
          </label>
          <InputText
            type="number"
            id="cajas_inoculadas_destino"
            value={registro.cajas_inoculadas_destino}
            onChange={(e) => onInputChange(e, "cajas_inoculadas_destino")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="gm_neonato_caja" className="font-bold">
            g neonato x caja{" "}
            {submitted && !registro.gm_neonato_caja && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="gm_neonato_caja"
            value={registro.gm_neonato_caja}
            onChange={(e) => onInputChange(e, "gm_neonato_caja")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="cantidad_dieta_caja" className="font-bold">
            Cantidad dieta x caja{" "}
            {submitted && !registro.cantidad_dieta_caja && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="cantidad_dieta_caja"
            value={registro.cantidad_dieta_caja}
            onChange={(e) => onInputChange(e, "cantidad_dieta_caja")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="temp_ambiental" className="font-bold">
            Temperatura Ambiental{" "}
            {submitted && !registro.temp_ambiental && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="temp_ambiental"
            value={registro.temp_ambiental}
            onChange={(e) => onInputChange(e, "temp_ambiental")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="hum_ambiental" className="font-bold">
            Humedad Ambiental{" "}
            {submitted && !registro.hum_ambiental && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="hum_ambiental"
            value={registro.hum_ambiental}
            onChange={(e) => onInputChange(e, "hum_ambiental")}
            required
            autoFocus
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
            value={registro.observaciones}
            onChange={(e) => onInputChange(e, "observaciones")}
            required
            autoFocus
          />
        </div>
      </Dialog>

     
    </>
  );
}
export default NIB;
