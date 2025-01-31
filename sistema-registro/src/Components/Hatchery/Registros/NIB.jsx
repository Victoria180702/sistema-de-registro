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
import { act } from "react";

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

  //Inicio de FETCH REGISTROS
  const fetchNeonatos = async () => {
    //Funcion asyncrona para obtener los datos de la tabla Usuarios
    const { data, error } = await supabase.from("Neonatos_Inoculados").select(); //Constante de data y error que es un await, es decir espera a que reciba una respuesta de la variable supabase, de la tabla "Uusarios" y hace un select de toda la tabla
    // console.log(error ? "Error:" : "Datos:", error || data); //YUn console log que nos dice si hay un error o si se obtuvieron los datos
    setNeonatos(data || []); //Setea la variable Usuarios con los datos obtenidos o un array vacio si no se obtuvieron datos
  };

  useEffect(() => {
    //Este useEffect es un hook para que solo se ejecute una sola vez al cargar la pagina
    fetchNeonatos(); //Ejecuta la funcion fetchUsuarios que obtiene los datos de la tabla Usuarios
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
        const exportData = selectedNeonatos.map((row) => ({
          ...row,
          registrado: `${row.fec_colecta || ""} ${row.hor_colecta || ""}`, // Combina las fechas
        }));

        // Generar la tabla en el PDF
        doc.autoTable({
          columns: exportColumns, // Define los encabezados
          body: exportData, // Pasa los datos con el campo combinado
          theme: "grid", // Tema de la tabla
          styles: {
            halign: "center", // Centrar texto en celdas
            valign: "middle", // Centrar verticalmente
          },
          headStyles: { fillColor: [85, 107, 47] }, // Color del encabezado
        });

        // Descargar el archivo PDF
        doc.save("Neonatos Inoculados.pdf");
      });
    });
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
        })
        .eq("id", id);

      if (error) {
        console.error("Error al actualizar:", error.message);
        return;
      }

      // console.log(`Fila con ID ${id} actualizada correctamente.`);

      // Actualizar solo la fila editada en el estado
      setNeonatos(prevneonato => 
        prevneonato.map(neonato => 
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
    // console.log(neonato);
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
        detail: "Usuario creado correctamente",
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
        <h1>Neonatos Inoculaods</h1>
        <button onClick={() => navigate(-1)} className="back-buttontest">
          Volver
        </button>
        <br></br>
        <button onClick={() => navigate(-2)} className="back-buttontest">
          Menú Principal
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
          <label htmlFor="# de Embudo" className="font-bold">
            # de Embudo{" "}
            {submitted && !neonato.embudo && (
              <small className="p-error">Requerido.</small>
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

          <label htmlFor="g Colectados" className="font-bold">
            g Colectados{" "}
            {submitted && !neonato.gm_colectados && (
              <small className="p-error">Requerido.</small>
            )}
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
          <label htmlFor="Cajas Inoculadas / Destido" className="font-bold">
            Cajas Inoculadas / Destido{" "}
            {submitted && !neonato.cajas_inoculadas_destino && (
              <small className="p-error">Requerido.</small>
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
          <label htmlFor="g neonato x caja" className="font-bold">
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
          <label htmlFor="Cantidad dieta x caja" className="font-bold">
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
          <label htmlFor="Temperatura Ambiental" className="font-bold">
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
          <label htmlFor="Humedad Ambiental" className="font-bold">
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
          <label htmlFor="Operario" className="font-bold">
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
