import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./IngresoPPInvernadero.css"; //Estilos de la tabla

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

function IngresoPPInvernadero() {
  //Variable de registro vacio
  const emptyRegister = {
    fec_ingreso_pp: "",
    lote_cosecha_pp: "",
    nave: "", // propiedad para la nave
    cantidad_ur: "",
    kg_pp_modulo: "",
    kg_pp_ur: "",
    cantidad_pp_modulo: "",
    kg_pp_redsea: "",
    fec_cam_camas: "",
    observaciones: "",
    // ... otras propiedades según corresponda
  };

  const [IngresoPPs, setIngresoPPs] = useState([]); //Variable de estado que guarda los datos de la tabla Usuarios
  const [pupa, setPupa] = useState(emptyRegister); //Variable de estado que guarda los datos de un usuario

  const toast = useRef(null); //Variable de referencia para mostrar mensajes emergentes
  const dt = useRef(null); //Variable de referencia para la tabla
  const [selectedIngresoPPs, setSelectedIngresoPPs] = useState([]); //Variable de estado que guarda los usuarios seleccionados
  const [globalFilter, setGlobalFilter] = useState(null); //Variable de estado que guarda el filtro de busqueda
  const [submitted, setSubmitted] = useState(false); //Variable de estado que guarda si se ha enviado un formulario
  const [pupaDialog, setPupaDialog] = useState(false); //Variable de estado que guarda si se muestra el dialogo de usuario
  const [deletePPDialog, setDeletePPDialog] = useState(false); //Variable de estado que guarda si se muestra el dialogo de eliminar usuario
  const [deleteIngresoPPsDialog, setDeleteIngresoPPsDialog] = useState(false); //Variable de estado que guarda si se muestra el dialogo de eliminar usuarios
  const navigate = useNavigate(); //Variable de navegación
  const [observacionesObligatorio, setObservacionesObligatorio] =
    useState(false);
  const [fechaRegistro, setFechaRegistro] = useState(""); //Variable de estado que guarda la fecha de registro actual
  const [erroresValidacion, setErroresValidacion] = useState({
    cantidad_ur: false,
    kg_pp_modulo: false,
    cantidad_pp_modulo: false,
    kg_pp_redsea: false,
  });
  const naves = [
    { name: "Nave 1", value: "Nave 1" },
    { name: "Nave 2", value: "Nave 2" },
    { name: "Nave 3", value: "Nave 3" },
    { name: "Nave 4", value: "Nave 4" },
  ];

  //Inicio de FETCH REGISTROS
  const fetchIngresoPPInvernadero = async () => {
    try {
      const { data, error } = await supabase
        .from("Ingreso_PP_Invernadero")
        .select();
      
      if (error) throw error; // Si hay error, lanza una excepción
      
      setIngresoPPs(data || []); // Guarda los datos en el estado
    } catch (err) {  // Captura el error real
      console.error("Error en la conexión a la base de datos:", err);
    }
  };

  useEffect(() => {
    //Este useEffect es un hook para que solo se ejecute una sola vez al cargar la pagina
    fetchIngresoPPInvernadero(); //Ejecuta la funcion fetchUsuarios que obtiene los datos de la tabla Usuarios
  }, []);
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
    if (selectedIngresoPPs.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "No hay filas seleccionadas para exportar.",
        life: 3000,
      });
      return; // Detener la ejecución si no hay filas seleccionadas
    }
  
    const doc = new jsPDF();

    // Configuración del título
    doc.setFontSize(18);
    doc.text("Registros de Cosecha Eggies Invernadero - Embudos", 14, 22);

    // Combinar datos seleccionados con el campo "registrado"
    const exportData = selectedIngresoPPs.map((row) => ({
      ...row,
      registrado: `${row.fec_registro || ""} ${row.hor_registro || ""}`, // Combina las fechas
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
    doc.save("Ingreso_PrePupas_Invernadero.pdf");
  };

  

  const exportXlsx = () => {
    if (selectedIngresoPPs.length === 0) {
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

    // Combinar los datos seleccionados y agregar el campo "registrado"
    const exportData = selectedIngresoPPs.map((registro) => ({
      ...registro,
      registrado: `${registro.fec_registro || ""} ${
        registro.hor_registro || ""
      }`,
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
    XLSX.writeFile(wb, "Ingreso_PP_Invernadero.xlsx");
  };



  // Columnas de la tabla para exportar
  const cols = [
    { field: "fec_ingreso_pp", header: "Ingreso PP" },
    { field: "lote_cosecha_pp", header: "# Lote" },
    { field: "nave", header: "Nave" },
    { field: "cantidad_ur", header: "# UR's" },
    { field: "kg_pp_modulo", header: "KG PP/Modulo" },
    { field: "kg_pp_ur", header: "KG PP/UR" },
    { field: "cantidad_pp_modulo", header: "# PP/Modulo" },
    { field: "kg_pp_redsea", header: "KG PP/RedSea" },
    { field: "fec_cam_camas", header: "Cambio Cama Pupado" },
    { field: "observaciones", header: "Observaciones" },
    { field: "registrado", header: "Registrado" }, // Campo combinado
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
      fec_ingreso_pp, // no se debería cambiar
      lote_cosecha_pp, // no se debería cambiar
      nave,
      cantidad_ur,
      kg_pp_modulo,
      kg_pp_ur,
      cantidad_pp_modulo,
      kg_pp_redsea,
      fec_cam_camas,
      observaciones,
    } = newData;

    // Convertir fec_cam_camas al formato ISO (yyyy-MM-dd)
    const formattedFecCamCamas = fec_cam_camas
      ? new Date(fec_cam_camas)
          .toISOString()
          .split("T")[0]
          .split("-")
          .reverse()
          .join("/")
      : null;

    console.log("Datos enviados para actualizar:", {
      id,
      fec_ingreso_pp,
      nave,
      cantidad_ur,
      kg_pp_modulo,
      kg_pp_ur,
      cantidad_pp_modulo,
      kg_pp_redsea,
      fec_cam_camas: formattedFecCamCamas, // Asegúrate de inspeccionar este valor
      observaciones,
    });

    try {
      const { error } = await supabase
        .from("Ingreso_PP_Invernadero")
        .update({
          fec_ingreso_pp, // no se debería cambiar
          nave,
          cantidad_ur,
          kg_pp_modulo,
          kg_pp_ur,
          cantidad_pp_modulo,
          kg_pp_redsea,
          fec_cam_camas: formattedFecCamCamas,
          observaciones,
        })
        .eq("id", id);

      if (error) {
        console.error("Error al actualizar:", error.message);
        return;
      }

      console.log(`Fila con ID ${id} actualizada correctamente.`);

      // Actualizar solo la fila editada en el estado
      console.log("IngresoPPs:", IngresoPPs);
      setIngresoPPs(
        IngresoPPs.map((ingresopp) =>
          ingresopp.id === id
            ? { ...newData, fec_cam_camas: formattedFecCamCamas }
            : ingresopp
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
  const DropdownEditor = (options, type) => (
    <Dropdown
      value={options.value || ""} // Asegura que no sea undefined
      onChange={(e) => options.editorCallback(e.value)} // Callback para notificar el cambio
      options={type} // Opciones disponibles
      optionLabel="name" // Campo que muestra el texto visible
      optionValue="value" // Campo que identifica el valor único
      placeholder="Select a type" // Placeholder cuando no hay valor
      className="w-full md:w-14rem" // Estilo de ancho responsivo
    />
  );
  const allowEdit = (rowData) => {
    return rowData.name !== "Blue Band";
  };

  const saveIngresoPP = async () => {
    setSubmitted(true);

    // Validar los campos
    const isCantidadURInvalida =
      pupa.cantidad_ur < 20 || pupa.cantidad_ur > 100;
    const isKgPPModuloInvalido =
      pupa.kg_pp_modulo < 10 || pupa.kg_pp_modulo > 25;
    const isCantidadPPModuloInvalido =
      pupa.cantidad_pp_modulo < 50 || pupa.cantidad_pp_modulo > 100;
    const isKgPPRedseaInvalido =
      pupa.kg_pp_redsea < 400 || pupa.kg_pp_redsea > 550;

    // Actualizar el estado de errores
    setErroresValidacion({
      cantidad_ur: isCantidadURInvalida,
      kg_pp_modulo: isKgPPModuloInvalido,
      cantidad_pp_modulo: isCantidadPPModuloInvalido,
      kg_pp_redsea: isKgPPRedseaInvalido,
    });

    // Verificar si hay algún valor fuera de rango
    const valoresFueraDeRango =
      isCantidadURInvalida ||
      isKgPPModuloInvalido ||
      isCantidadPPModuloInvalido ||
      isKgPPRedseaInvalido;

    if (
      !pupa.fec_ingreso_pp ||
      !pupa.lote_cosecha_pp ||
      !pupa.nave ||
      !pupa.cantidad_ur ||
      !pupa.kg_pp_modulo ||
      !pupa.kg_pp_ur ||
      !pupa.cantidad_pp_modulo ||
      !pupa.kg_pp_redsea ||
      !pupa.fec_cam_camas
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
    if (valoresFueraDeRango && !pupa.observaciones) {
      setObservacionesObligatorio(true);
      const currentErrores = {
        "Cantidad UR": isCantidadURInvalida,
        "Kg PrePupa Modulo": isKgPPModuloInvalido,
        "Cantidad PrePupa Modulo": isCantidadPPModuloInvalido,
        "Kg PrePupa RedSea": isKgPPRedseaInvalido,
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
      cantidad_ur: false,
      kg_pp_modulo: false,
      cantidad_pp_modulo: false,
      kg_pp_redsea: false,
    });

    try {
      const formattedFecCamCamas = pupa.fec_cam_camas
        ? new Date(pupa.fec_cam_camas)
            .toISOString()
            .split("T")[0]
            .split("-")
            .reverse()
            .join("/")
        : null;

      const formattedFecIngresoPP = pupa.fec_ingreso_pp
        ? new Date(pupa.fec_ingreso_pp)
            .toISOString()
            .split("T")[0]
            .split("-")
            .reverse()
            .join("/")
        : null;

      const currentDate = formatDateTime(new Date(), "DD/MM/YYYY");
      const currentTime = formatDateTime(new Date(), "hh:mm A");

      const { data, error } = await supabase
        .from("Ingreso_PP_Invernadero")
        .insert([
          {
            fec_ingreso_pp: formattedFecIngresoPP,
            lote_cosecha_pp: pupa.lote_cosecha_pp,
            nave: pupa.nave,
            cantidad_ur: pupa.cantidad_ur,
            kg_pp_modulo: pupa.kg_pp_modulo,
            kg_pp_ur: pupa.kg_pp_ur,
            cantidad_pp_modulo: pupa.cantidad_pp_modulo,
            kg_pp_redsea: pupa.kg_pp_redsea,
            fec_cam_camas: formattedFecCamCamas,
            fec_registro: currentDate,
            hor_registro: currentTime,
            observaciones: pupa.observaciones,
          },
        ]);

      if (error) {
        console.error("Error en Supabase:", error);
        throw new Error(
          error.message || "Error desconocido al guardar en Supabase"
        );
      }

      console.log("Datos insertados:", data);
      toast.current.show({
        severity: "success",
        summary: "Exitoso",
        detail: "Registro guardado exitosamente",
        life: 3000,
      });

      // Limpia el estado
      setPupa(emptyRegister);
      setPupaDialog(false);
      setSubmitted(false);
      fetchIngresoPPInvernadero();
    } catch (error) {
      console.error("Error capturado en el catch:", error.message);
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

    console.log(`${name}: ` + val); // Mostrar el nombre del campo y el valor que se actualizó.

    // Crear una copia del estado del usuario
    let _pupa = { ...pupa };

    // Actualizar el valor de la propiedad correspondiente
    _pupa[`${name}`] = val;

    // Actualizar el estado del usuario
    setPupa(_pupa);
  };

  const onDropdownChange = (e, name) => {
    const val = e.value;
    console.log(`${name}: ${val}`); // Depura el valor seleccionado

    setorden((prevOrdenes) => ({
      ...prevOrdenes,
      [name]: val, // Guarda el valor seleccionado
    }));
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
          //disabled={selectedIngresoPPs.length === 0}
        />
        <Button
          label="Exportar a PDF"
          icon="pi pi-file-pdf"
          className="p-button-danger"
          onClick={exportPdf}
          //disabled={selectedIngresoPPs.length === 0}
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
    setPupa(emptyRegister);
    setSubmitted(false);
    setPupaDialog(true);
  };
  const hideDialog = () => {
    setSubmitted(false);
    setPupaDialog(false);
  };

  const pupaDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" onClick={saveIngresoPP} />
    </React.Fragment>
  );

  // //Fin de DIALOGO DE REGISTRO

  return (
    <>
      <div className="tabla-container">
        <Toast ref={toast} />
        <h1>
          <img src={logo2} alt="mosca" className="logo2" />
          Ingreso PrePupas Invernadero
        </h1>
        <div className="welcome-message">
          <p>
            Bienvenido al sistema de Ingreso PrePupas Invernadero. Aquí puedes
            gestionar los registros ingreso de prepuas al invernadero.
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
            value={IngresoPPs}
            selection={selectedIngresoPPs}
            onSelectionChange={(e) => setSelectedIngresoPPs(e.value)}
            onRowEditInit={(e) => setPupa(e.data)}
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
              field="fec_ingreso_pp"
              header="Fecha Ingreso PP"
              // editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="lote_cosecha_pp"
              header="Lote Cosecha PP"
              // editor={(options) => dateEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="nave"
              header="Nave"
              editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "8rem" }}
            ></Column>
            <Column
              field="cantidad_ur"
              header="Cantidad UR's"
              editor={(options) => numberEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="kg_pp_modulo"
              header="KG PP / Modulo"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="kg_pp_ur"
              header="KG PP / UR"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "8rem" }}
            ></Column>
            <Column
              field="cantidad_pp_modulo"
              header="Cantidad PP / Modulo"
              editor={(options) => numberEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="kg_pp_redsea"
              header="KG PP / Red Sea"
              editor={(options) => floatEditor(options)}
              sortable
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="fec_cam_camas"
              header="Cambio Cama Pupado"
              editor={(options) => dateEditor(options)}
              sortable
              style={{ minWidth: "11rem" }}
            ></Column>
            <Column
              field="fec_registro"
              header="Dia de Registro"
              // editor={(options) => textEditor(options)}
              sortable
              style={{ minWidth: "14rem" }}
            ></Column>
            <Column
              field="hor_registro"
              header="Hora de Registro el"
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
              header="Herramientas"
              rowEditor={allowEdit}
              headerStyle={{ width: "10%", minWidth: "5rem" }}
              bodyStyle={{ textAlign: "center" }}
            ></Column>
          </DataTable>
        </div>
      </div>

      <Dialog
        visible={pupaDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Nuevo Registro"
        modal
        className="p-fluid"
        footer={pupaDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="fec_ingreso_pp" className="font-bold">
            Fecha Ingreso PrePupa{" "}
            {submitted && !pupa.fec_ingreso_pp && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="date"
            id="fec_ingreso_pp"
            value={pupa.fec_ingreso_pp}
            onChange={(e) => onInputChange(e, "fec_ingreso_pp")}
            required
            autoFocus
          />
          <br />

          <label htmlFor="lote_cosecha_pp" className="font-bold">
            Lote Cosecha{" "}
            {submitted && !pupa.lote_cosecha_pp && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            id="lote_cosecha_pp"
            value={pupa.lote_cosecha_pp}
            onChange={(e) => onInputChange(e, "lote_cosecha_pp")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="nave" className="font-bold">
            Nave{" "}
            {submitted && !pupa.nave && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <Dropdown
            value={pupa.nave}
            onChange={(e) => setPupa({ ...pupa, nave: e.value })}
            options={naves}
            optionLabel="name"
            placeholder="Selecciona una nave"
            className="w-full md:w-14rem"
          />

          {/* <InputText
            id="nave"
            type="Dropdown"
            value={pupa.nave}
            onChange={(e) => onInputChange(e, "nave")}
            required
            autoFocus
          /> */}

          <br />
          <label htmlFor="cantidad_ur" className="font-bold">
            Cantidad UR{" "}
            {submitted && !pupa.cantidad_ur && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.cantidad_ur && (
              <small className="p-error">
                Cantidad UR debe estar entre 20 y 100.
              </small>
            )}
          </label>
          <InputText
            type="number"
            id="cantidad_ur"
            value={pupa.cantidad_ur}
            onChange={(e) => onInputChange(e, "cantidad_ur")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="kg_pp_modulo" className="font-bold">
            KG PrePupa / Modulo{" "}
            {submitted && !pupa.kg_pp_modulo && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.kg_pp_modulo && (
              <small className="p-error">
                Kg PrePupa Modulo debe estar entre 10 y 25 Kg por caja.
              </small>
            )}
          </label>
          <InputText
            type="float"
            id="kg_pp_modulo"
            value={pupa.kg_pp_modulo}
            onChange={(e) => onInputChange(e, "kg_pp_modulo")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="kg_pp_ur" className="font-bold">
            Kg PrePupa UR{" "}
            {submitted && !pupa.kg_pp_ur && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="kg_pp_ur"
            value={pupa.kg_pp_ur}
            onChange={(e) => onInputChange(e, "kg_pp_ur")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="cantidad_pp_modulo" className="font-bold">
            Cantidad PrePupa Modulo{" "}
            {submitted && !pupa.cantidad_pp_modulo && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.cantidad_pp_modulo && (
              <small className="p-error">
                Cantidad PrePupa Modulo debe estar entre 50K y 100K.
              </small>
            )}
          </label>
          <InputText
            type="number"
            id="cantidad_pp_modulo"
            value={pupa.cantidad_pp_modulo}
            onChange={(e) => onInputChange(e, "cantidad_pp_modulo")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="kg_pp_redsea" className="font-bold">
            Kg PrePupa RedSea{" "}
            {submitted && !pupa.kg_pp_redsea && (
              <small className="p-error">Requerido.</small>
            )}
            {erroresValidacion.kg_pp_redsea && (
              <small className="p-error">
                Kg PrePupa RedSea debe estar entre 400 y 550.
              </small>
            )}
          </label>
          <InputText
            type="float"
            id="kg_pp_redsea"
            value={pupa.kg_pp_redsea}
            onChange={(e) => onInputChange(e, "kg_pp_redsea")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="fec_cam_camas" className="font-bold">
            Fecha Cambio Camas Pupado{" "}
            {submitted && !pupa.fec_cam_camas && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="date"
            id="fec_cam_camas"
            value={pupa.fec_cam_camas}
            onChange={(e) => onInputChange(e, "fec_cam_camas")}
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
            value={pupa.observaciones}
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
export default IngresoPPInvernadero;
