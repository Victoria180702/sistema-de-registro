import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./NIB.css"; //Estilos de la tabla

import supabase from "../../../supabaseClient"; //Importa la variable supabase del archivo supabaseClient.js que sirve para conectarse con la base de datos y que funcione como API

//PRIME REACT
import "primereact/resources/themes/lara-dark-indigo/theme.css"; //theme
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
import { act } from "react";
import * as XLSX from "xlsx";
import logo2 from "../../../assets/mosca.png";
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

  const [neonatos, setNeonatos] = useState([]); //Variable de estado que guarda los datos de la tabla Usuarios
  const [neonato, setNeonato] = useState(emptyRegister); //Variable de estado que guarda los datos de un usuario

  const toast = useRef(null); //Variable de referencia para mostrar mensajes emergentes
  const dt = useRef(null); //Variable de referencia para la tabla
  const [selectedNeonatos, setSelectedNeonatos] = useState([]); //Variable de estado que guarda los usuarios seleccionados
  const [globalFilter, setGlobalFilter] = useState(null); //Variable de estado que guarda el filtro de busqueda
  const [submitted, setSubmitted] = useState(false); //Variable de estado que guarda si se ha enviado un formulario
  const [neonatoDialog, setNeonatoDialog] = useState(false); //Variable de estado que guarda si se muestra el dialogo de usuario
  const [deleteNeonatoDialog, setDeleteNeonatoDialog] = useState(false); //Variable de estado que guarda si se muestra el dialogo de eliminar usuario
  const [deleteNeonatosDialog, setDeleteNeonatosDialog] = useState(false); //Variable de estado que guarda si se muestra el dialogo de eliminar usuarios
  const navigate = useNavigate(); //Variable de navegación
  const [observacionesObligatorio, setObservacionesObligatorio] =
    useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({
    embudo: false,
    gm_colectados: false,
    cajas_inoculadas_destino: false,
  });

  const [loteIdSeleccionado, setLoteIdSeleccionado] = useState(null); // Estado para almacenar el lote_id seleccionado

  const [lotes, setLotes] = useState([]); // Estado para almacenar los lote_ids disponibles
  //Inicio de FETCH REGISTROS
  // Función para obtener los datos de la tabla Neonatos_Inoculados
  const fetchNeonatos = async () => {
    try {
      const { data, error } = await supabase
        .from("Neonatos_Inoculados")
        .select(); // Solo seleccionamos el campo lote_id

      if (error) throw error; // Si hay un error, lanzamos una excepción

      setNeonatos(data || []); // Guardamos los datos obtenidos en el estado

      // Formatear los datos para solo obtener el lote_id y ponerlos en el estado de lotes
      const loteIds = data.map((neonato) => ({
        label: neonato.lote_id, // La etiqueta que mostrará el dropdown
        value: neonato.lote_id, // El valor real que se seleccionará
      }));

      setLotes(loteIds); // Guardamos los lote_id en el estado 'lotes'
    } catch (err) {
      console.log("Error en la conexión a la base de datos", err);
    }
  };

  // Este useEffect se ejecuta cuando el componente se monta, para obtener los datos una vez
  useEffect(() => {
    fetchNeonatos(); // Llamar a la función para obtener los datos
  }, []); // El array vacío asegura que solo se ejecute una vez cuando el componente se monta

  useEffect(() => {
    console.log("Neonatos actualizados: ", neonatos); // Solo se ejecuta cuando 'neonatos' cambia
  }, [neonatos]); // Este useEffect se ejecuta cada vez que el estado 'neonatos' cambia

  //Fin de FETCH REGISTROS

  //Inicio Formatear la FECHA DE REGISTRO
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

    // Convertir fecha al formato inicial
    const parts = formatter.formatToParts(date);

    // Crear un mapa con los valores para personalizar el formato
    const dateMap = parts.reduce((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

    // Reemplazar los patrones en el formato
    return format
      .replace("DD", dateMap.day)
      .replace("MM", dateMap.month)
      .replace("YYYY", dateMap.year)
      .replace("hh", dateMap.hour.padStart(2, "0"))
      .replace("mm", dateMap.minute)
      .replace("A", dateMap.dayPeriod || "AM");
  };
  //Fin Formatear la FECHA DE REGISTRO

  const exportPdf = () => {
    if (selectedNeonatos.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "No hay filas seleccionadas para exportar.",
        life: 3000,
      });
      return; // Detener la ejecución si no hay filas seleccionadas
    }

    // Resto del código para generar el PDF...
    const doc = new jsPDF();

    // Configuración del título
    doc.setFontSize(18);
    doc.text("Registros de Cosecha Eggies Invernadero - Embudos", 14, 22);

    const exportData = selectedNeonatos.map((row) => ({
      ...row,
      registrado: `${row.fec_colecta || ""} ${row.hor_colecta || ""}`, // Combina las fechas
    }));

    // Mapear cada registro en un array de valores en el mismo orden de exportColumns
    const body = exportData.map((row) =>
      exportColumns.map((col) => row[col.dataKey])
    );
    // Configuración de la tabla
    doc.autoTable({
      head: [exportColumns.map((col) => col.title)], // Encabezados de la tabla
      body: body, // Datos de la tabla
      startY: 30, // Posición inicial de la tabla
      styles: { fontSize: 10 }, // Estilo de la tabla
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Estilo del encabezado
    });

    // Guardar el PDF
    doc.save("Eggies_Colecta_Invernadero_Embudo.pdf");
  };

  const exportXlsx = () => {
    if (selectedNeonatos.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "No hay filas seleccionadas para exportar.",
        life: 3000,
      });
      return; // Detener la ejecución si no hay filas seleccionadas
    }

    // Resto del código para generar el XLSX...
    // Obtener los encabezados de las columnas
    const headers = cols.map((col) => col.header); // Mapear solo los encabezados de las columnas

    const exportData = selectedNeonatos.map((registro) => ({
      ...registro,
      registrado: `${registro.fec_colecta || ""} ${registro.hor_colecta || ""}`,
    }));
    // Obtener los datos seleccionados y mapearlos para las columnas
    const rows = exportData.map(
      (registro) => cols.map((col) => registro[col.field]) // Mapear los valores de cada fila por las columnas
    );

    // Agregar la fila de encabezados al principio de los datos
    const dataToExport = [headers, ...rows];

    // Crear una hoja de trabajo a partir de los encabezados y los datos
    const ws = XLSX.utils.aoa_to_sheet(dataToExport);

    // Configurar el estilo de la hoja para asegurar la correcta separación de celdas
    const wscols = cols.map((col) => ({
      width: Math.max(col.header.length, 10),
    })); // Ajustar el ancho de las columnas según los encabezados
    ws["!cols"] = wscols;

    // Crear un libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");

    // Exportar el archivo .xlsx
    XLSX.writeFile(wb, "Neonatos_Inoculaddos.xlsx");
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
    { header: "Recolectado", field: "registrado" },
  ];

  // Mapeo de columnas para jsPDF-Autotable
  const exportColumns = cols.map((col) => ({
    title: col.header, // Título del encabezado
    dataKey: col.field, // Llave de datos
  }));

  // Fin de EXPORTAR TABLA

  // //Inicio de EDITAR TABLA
  const onRowEditComplete = async (e) => {
    const { newData } = e; // Obtén los datos de la fila
    const {
      id,
      embudo,
      gm_colectados,
      cajas_inoculadas_destino,
      gm_neonato_caja,
      cantidad_dieta_caja,
      temp_ambiental,
      hum_ambiental,
      operario,
      fec_colecta,
      hor_colecta,
      observaciones,
    } = newData;

    // console.log("Datos enviados para actualizar:", {
    //   id,
    //   embudo,
    //   gm_colectados,
    //   cajas_inoculadas_destino,
    //   gm_neonato_caja,
    //   cantidad_dieta_caja,
    //   temp_ambiental,
    //   hum_ambiental,
    //   operario,

    // });

    try {
      const { error } = await supabase
        .from("Neonatos_Inoculados")
        .update({
          embudo,
          gm_colectados,
          cajas_inoculadas_destino,
          gm_neonato_caja,
          cantidad_dieta_caja,
          temp_ambiental,
          hum_ambiental,
          operario,
          observaciones,
        })
        .eq("id", id);

      if (error) {
        console.error("Error al actualizar:", error.message);
        return;
      }

      // console.log(`Fila con ID ${id} actualizada correctamente.`);

      // Actualizar solo la fila editada en el estado
      setNeonatos((prevneonato) =>
        prevneonato.map((neonato) =>
          neonato.id === id ? { ...neonato, ...newData } : neonato
        )
      );
    } catch (err) {
      console.error("Error inesperado:", err);
    }
  };

  const dateEditor = (options) => {
    return (
      <InputText
        type="date"
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

  const saveNeonatoInoculado = async () => {
    setSubmitted(true);

    // Validar los campos
    const isEmbudoInvalido = neonato.embudo < 1 || neonato.embudo > 10;
    // const isGmColectadosInvalido = neonato.gm_colectados < 1 || neonato.gm_colectados > 100;
    const isCajasInoculadasDestinoInvalido =
      neonato.cajas_inoculadas_destino < 100 ||
      neonato.cajas_inoculadas_destino > 500;
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
      !neonato.embudo ||
      !neonato.gm_colectados ||
      !neonato.cajas_inoculadas_destino ||
      !neonato.gm_neonato_caja ||
      !neonato.cantidad_dieta_caja ||
      !neonato.temp_ambiental ||
      !neonato.hum_ambiental ||
      !neonato.operario
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
    if (valoresFueraDeRango && !neonato.observaciones) {
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
            embudo: neonato.embudo,
            gm_colectados: neonato.gm_colectados,
            cajas_inoculadas_destino: neonato.cajas_inoculadas_destino,
            gm_neonato_caja: neonato.gm_neonato_caja,
            cantidad_dieta_caja: neonato.cantidad_dieta_caja,
            temp_ambiental: neonato.temp_ambiental,
            hum_ambiental: neonato.hum_ambiental,
            operario: neonato.operario,
            fec_colecta: currentDate,
            hor_colecta: currentTime,
            observaciones: neonato.observaciones,
            lote_id: neonato.lote_id,
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
      setNeonato(emptyRegister);
      setNeonatoDialog(false);
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

  const onInputChange = (e, name) => {
    // Obtener el valor dependiendo del tipo de input
    let val = e.target.value;

    // Si el valor proviene de un input type="number", debemos asegurarnos de convertirlo a número.
    if (e.target.type === "number") {
      val = val ? parseInt(val, 10) : ""; // Si no es un número, se lo dejamos vacío o le asignamos un valor numérico como 0.
    }

    // console.log(`${name}: ` + val); // Mostrar el nombre del campo y el valor que se actualizó.

    // Crear una copia del estado del usuario
    let _neonato = { ...neonato };

    // Actualizar el valor de la propiedad correspondiente
    _neonato[`${name}`] = val;

    // Actualizar el estado del usuario
    setNeonato(_neonato);
  };

  // //Fin de EDITAR TABLA

  // //Inicio de ELIMINAR REGISTRO
  // const deleteSelectedUsuarios = async () => {
  //   let actionMessage = "";
  //   const selectedIds = selectedUsuarios.map((usuario) => usuario.id); // Obtener los IDs de los usuarios seleccionados del array

  //   try {
  //     // Realizar la eliminación en Supabase con un array de IDs
  //     const { data, error } = await supabase
  //       .from("Usuarios")
  //       .delete()
  //       .in("id", selectedIds); // Usamos `.in` para eliminar varios IDs

  //     if (error) {
  //       console.error("Error eliminando:", error.message);
  //       toast.current.show({
  //         severity: "error",
  //         summary: "Error",
  //         detail: "No se pudieron eliminar los usuarios",
  //         life: 3000,
  //       });
  //     } else {
  //       actionMessage = "Usuarios Eliminados";
  //       console.log("Usuarios eliminados:", data);
  //     }
  //     // Mostrar mensaje de éxito
  //     toast.current.show({
  //       severity: "success",
  //       summary: "Exitoso",
  //       detail: actionMessage,
  //       life: 3000,
  //     });
  //     hideDeleteUsuariosDialog(); // Cerrar el diálogo de confirmación
  //     // Refrescar la lista de usuarios
  //     fetchUsuarios(); // Refrescar lista de usuarios
  //   } catch (error) {
  //     console.error("Error en la eliminación:", error);
  //     toast.current.show({
  //       severity: "error",
  //       summary: "Error",
  //       detail: "Ocurrió un error al eliminar los usuarios",
  //       life: 3000,
  //     });
  //   }
  // };

  // const hideDeleteUsuariosDialog = () => {
  //   setDeleteUsuariosDialog(false);
  // };

  // const confirmDeleteSelected = () => {
  //   setDeleteUsuariosDialog(true);
  // };

  // const deleteUsuariosDialogFooter = (
  //   <React.Fragment>
  //     <Button
  //       label="No"
  //       icon="pi pi-times"
  //       outlined
  //       onClick={hideDeleteUsuariosDialog}
  //     />
  //     <Button
  //       label="Yes"
  //       icon="pi pi-check"
  //       severity="danger"
  //       onClick={deleteSelectedUsuarios}
  //     />
  //   </React.Fragment>
  // );
  // //Fin de ELIMINAR REGISTRO

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
        {/* <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          onClick={confirmDeleteSelected}
          disabled={!selectedUsuarios || !selectedUsuarios.length}
        /> */}
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
          //disabled={selectedNeonatos.length === 0}
        />
        <Button
          label="Exportar a PDF"
          icon="pi pi-file-pdf"
          className="p-button-danger"
          onClick={exportPdf}
          //disabled={selectedNeonatos.length === 0}
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
          placeholder="Buscar..."
        />
      </IconField>
    </div>
  );

  const openNew = () => {
    setNeonato(emptyRegister);
    setSubmitted(false);
    setNeonatoDialog(true);
  };
  const hideDialog = () => {
    setSubmitted(false);
    setNeonatoDialog(false);
  };

  const neonatoDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" onClick={saveNeonatoInoculado} />
    </React.Fragment>
  );

  // //Fin de DIALOGO DE REGISTRO

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
            value={neonatos}
            selection={selectedNeonatos}
            onSelectionChange={(e) => setSelectedNeonatos(e.value)}
            onRowEditInit={(e) => setNeonato(e.data)}
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
        visible={neonatoDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Nuevo Registro"
        modal
        className="p-fluid"
        footer={neonatoDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
        <label htmlFor="lote_id" className="font-bold">
          Lote{" "}
          {submitted && !neonato.lote_id && (
            <small className="p-error">Requerido.</small>
          )}
        </label>
        <Dropdown
          value={neonato.lote_id}
          onChange={(e) => setNeonato({ ...neonato, lote_id: e.value })} // Actualiza el estado con el lote_id seleccionado
          options={lotes} // Los lote_ids disponibles
          optionLabel="label" // El valor a mostrar en el dropdown (lote_id)
          optionValue="value" // El valor real que se selecciona
          placeholder="Selecciona un lote"
          className="w-full md:w-14rem"
        />
          <br />
          <label htmlFor="embudo" className="font-bold">
            # de Embudo{" "}
            {submitted && !neonato.embudo && (
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
            value={neonato.embudo}
            onChange={(e) => onInputChange(e, "embudo")}
            required
            autoFocus
          />
          <br />

          <label htmlFor="gm_colectados" className="font-bold">
            g Colectados{" "}
            {submitted && !neonato.gm_colectados && (
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
            value={neonato.gm_colectados}
            onChange={(e) => onInputChange(e, "gm_colectados")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="cajas_inoculadas_destino" className="font-bold">
            Cajas Inoculadas / Destido{" "}
            {submitted && !neonato.cajas_inoculadas_destino && (
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
            value={neonato.cajas_inoculadas_destino}
            onChange={(e) => onInputChange(e, "cajas_inoculadas_destino")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="gm_neonato_caja" className="font-bold">
            g neonato x caja{" "}
            {submitted && !neonato.gm_neonato_caja && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="gm_neonato_caja"
            value={neonato.gm_neonato_caja}
            onChange={(e) => onInputChange(e, "gm_neonato_caja")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="cantidad_dieta_caja" className="font-bold">
            Cantidad dieta x caja{" "}
            {submitted && !neonato.cantidad_dieta_caja && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="cantidad_dieta_caja"
            value={neonato.cantidad_dieta_caja}
            onChange={(e) => onInputChange(e, "cantidad_dieta_caja")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="temp_ambiental" className="font-bold">
            Temperatura Ambiental{" "}
            {submitted && !neonato.temp_ambiental && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="temp_ambiental"
            value={neonato.temp_ambiental}
            onChange={(e) => onInputChange(e, "temp_ambiental")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="hum_ambiental" className="font-bold">
            Humedad Ambiental{" "}
            {submitted && !neonato.hum_ambiental && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="hum_ambiental"
            value={neonato.hum_ambiental}
            onChange={(e) => onInputChange(e, "hum_ambiental")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="operario" className="font-bold">
            Operario{" "}
            {submitted && !neonato.operario && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            id="operario"
            value={neonato.operario}
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
            value={neonato.observaciones}
            onChange={(e) => onInputChange(e, "observaciones")}
            required
            autoFocus
          />
        </div>
      </Dialog>

      {/* <Dialog
        visible={deleteUsuarioDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {user && (
            <span>
              Estas seguro que deseas eliminar el Usuario: <b>{user.name}</b>?
            </span>
          )}
        </div>
      </Dialog> */}

      {/* <Dialog
        visible={deleteUsuariosDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteUsuariosDialogFooter}
        onHide={hideDeleteUsuariosDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {user && (
            <span>
              ¿Estas seguro que quieres eliminar los Usuarios seleccionados?
            </span>
          )}
        </div>
      </Dialog> */}
    </>
  );
}
export default NIB;
