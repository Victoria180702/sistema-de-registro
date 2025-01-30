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
import { act } from "react";

function IngresoPPInvernadero() {
  //Variable de registro vacio
  let emptyRegister = {
    id: null,
    fecha: "",
    cantidad: "",
    origen: "",
    destino: "",
    observaciones: "",
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

  const [fechaRegistro, setFechaRegistro] = useState(""); //Variable de estado que guarda la fecha de registro actual

  //Inicio de FETCH REGISTROS
  const fetchIngresoPPInvernadero = async () => {
    //Funcion asyncrona para obtener los datos de la tabla Usuarios
    const { data, error } = await supabase
      .from("Ingreso_PP_Invernadero")
      .select(); //Constante de data y error que es un await, es decir espera a que reciba una respuesta de la variable supabase, de la tabla "Uusarios" y hace un select de toda la tabla
    console.log(error ? "Error:" : "Datos:", error || data); //YUn console log que nos dice si hay un error o si se obtuvieron los datos
    setIngresoPPs(data || []); //Setea la variable Usuarios con los datos obtenidos o un array vacio si no se obtuvieron datos
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


  // Inicio de EXPORTAR TABLA
const exportPdf = () => {
  // Importar las dependencias para generar el PDF
  import("jspdf").then((jsPDF) => {
    import("jspdf-autotable").then(() => {
      const doc = new jsPDF.default(0, 0); // Crear una instancia de jsPDF

      // Combinar datos seleccionados con el campo "registrado"
      const exportData = selectedIngresoPPs.map((row) => ({
        ...row,
        registrado: `${row.fec_registro || ""} ${row.hor_registro || ""}`, // Combina las fechas
      }));

      // Generar la tabla en el PDF
      doc.autoTable({
        columns: exportColumns, // Define los encabezados
        body: exportData,       // Pasa los datos con el campo combinado
        theme: "grid",          // Tema de la tabla
        styles: {
          halign: "center", // Centrar texto en celdas
          valign: "middle", // Centrar verticalmente
        },
        headStyles: { fillColor: [85, 107, 47] }, // Color del encabezado
      });

      // Descargar el archivo PDF
      doc.save("IngresoPPInvernadero.pdf");
    });
  });
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
  { field: "registrado", header: "Agregado" }, // Campo combinado
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
    } = newData;
  
    // Convertir fec_cam_camas al formato ISO (yyyy-MM-dd)
    const formattedFecCamCamas = fec_cam_camas
      ? new Date(fec_cam_camas).toISOString().split("T")[0].split("-").reverse().join("/")
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
        })
        .eq("id", id);
  
      if (error) {
        console.error("Error al actualizar:", error.message);
        return;
      }
  
      console.log(`Fila con ID ${id} actualizada correctamente.`);
  
      // Actualizar solo la fila editada en el estado
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
  const allowEdit = (rowData) => {
    return rowData.name !== "Blue Band";
  };

  const saveIngresoPP = async () => {
    setSubmitted(true);
    if (!pupa.fec_ingreso_pp || !pupa.lote_cosecha_pp || !pupa.nave || !pupa.cantidad_ur || !pupa.kg_pp_modulo || !pupa.kg_pp_ur || !pupa.cantidad_pp_modulo || !pupa.kg_pp_redsea || !pupa.fec_cam_camas) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Llena todos los campos",
        life: 3000,
      });
      return;
    }
    try {
       // Convertir fec_cam_camas al formato dd/mm/yyyy
    const formattedFecCamCamas = pupa.fec_cam_camas
    ? new Date(pupa.fec_cam_camas).toISOString().split("T")[0].split("-").reverse().join("/")
    : null;

    const formattedFecIngresoPP = pupa.fec_ingreso_pp
      ? new Date(pupa.fec_ingreso_pp).toISOString().split("T")[0].split("-").reverse().join("/")
      : null;

    const currentDate = formatDateTime(new Date(), "DD/MM/YYYY"); // Solo fecha
    const currentTime = formatDateTime(new Date(), "hh:mm A"); // Fecha en formato ISO 8601
      const { data, error } = await supabase.from("Ingreso_PP_Invernadero").insert([
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
        },
      ]);
    
      if (error) {
        console.error("Error en Supabase:", error);
        throw new Error(error.message || "Error desconocido al guardar en Supabase");
      }
    
      console.log("Datos insertados:", data);
      toast.current.show({
        severity: "success",
        summary: "Exitoso",
        detail: "Usuario creado correctamente",
        life: 3000,
      });
    
      // Limpia el estado
      setPupa(emptyRegister);
      setPupaDialog(false);
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
      <Button
        label="Export"
        icon="pi pi-upload"
        className="p-button-help"
        onClick={exportPdf}
      />
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
        <button onClick={() => navigate(-1)} className="back-buttontest">
            Volver
          </button>
          <br></br>
          <button onClick={() => navigate(-2)} className="back-buttontest">
            Menú Principal
          </button>
        <div className="tabla-scroll">
          <h1>Ingreso PP a Invernadero</h1>
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
        header="Nuevo Usuario"
        modal
        className="p-fluid"
        footer={pupaDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="Fecha Ingreso PrePupa" className="font-bold">
            Fecha Ingreso PrePupa{" "}
            {submitted && !IngresoPPs.fec_ingreso_pp && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="date"
            id="fec_ingreso_pp"
            value={IngresoPPs.fec_ingreso_pp}
            onChange={(e) => onInputChange(e, "fec_ingreso_pp")}
            required
            autoFocus
          />
          <br />

          <label htmlFor="Lote Cosecha" className="font-bold">
            Lote Cosecha{" "}
            {submitted && !IngresoPPs.lote_cosecha_pp && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            id="lote_cosecha_pp"
            value={IngresoPPs.lote_cosecha_pp}
            onChange={(e) => onInputChange(e, "lote_cosecha_pp")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="Nave" className="font-bold">
            Nave{" "}
            {submitted && !IngresoPPs.nave && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            id="nave"
            value={IngresoPPs.nave}
            onChange={(e) => onInputChange(e, "nave")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="Cantidad UR" className="font-bold">
            Cantidad UR{" "}
            {submitted && !IngresoPPs.cantidad_ur && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="cantidad_ur"
            value={IngresoPPs.cantidad_ur}
            onChange={(e) => onInputChange(e, "cantidad_ur")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="KG PrePupa/Modulo" className="font-bold">
            KG PrePupa / Modulo{" "}
            {submitted && !IngresoPPs.kg_pp_modulo && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="kg_pp_modulo"
            value={IngresoPPs.kg_pp_modulo}
            onChange={(e) => onInputChange(e, "kg_pp_modulo")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="KG PrePupa UR" className="font-bold">
            KG PrePupa UR{" "}
            {submitted && !IngresoPPs.kg_pp_ur && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="kg_pp_ur"
            value={IngresoPPs.kg_pp_ur}
            onChange={(e) => onInputChange(e, "kg_pp_ur")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="Cantidad PrePupa Modulo" className="font-bold">
            Cantidad PrePupa Modulo{" "}
            {submitted && !IngresoPPs.cantidad_pp_modulo && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="number"
            id="cantidad_pp_modulo"
            value={IngresoPPs.cantidad_pp_modulo}
            onChange={(e) => onInputChange(e, "cantidad_pp_modulo")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="KG PrePupa RedSea" className="font-bold">
            KG PrePupa RedSea{" "}
            {submitted && !IngresoPPs.kg_pp_redsea && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="float"
            id="kg_pp_redsea"
            value={IngresoPPs.kg_pp_redsea}
            onChange={(e) => onInputChange(e, "kg_pp_redsea")}
            required
            autoFocus
          />

          <br />
          <label htmlFor="Fecha Cambio Camas Pupado" className="font-bold">
            Fecha Cambio Camas Pupado{" "}
            {submitted && !IngresoPPs.fec_cam_camas && (
              <small className="p-error">Requerido.</small>
            )}
          </label>
          <InputText
            type="date"
            id="fec_cam_camas"
            value={IngresoPPs.fec_cam_camas}
            onChange={(e) => onInputChange(e, "fec_cam_camas")}
            required
            autoFocus
          />
          <br />
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
