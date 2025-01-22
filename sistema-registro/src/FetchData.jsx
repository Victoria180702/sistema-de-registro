import React, { useEffect, useState, useRef } from "react";
import "./Login.css";
import supabase from "./supabaseClient.js"; //Importa la variable supabase del archivo supabaseClient.js que sirve para conectarse con la base de datos y que funcione como API

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

function FetchData() {
  let emptyUser = {
    id: null,
    name: "",
    age: null,
    address: "",
  };

  const [Usuarios, setUsuarios] = useState([]);
  const [user, setUser] = useState(emptyUser);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const toast = useRef(null);
  const dt = useRef(null);
  const [selectedUsuarios, setSelectedUsuarios] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [userDialog, setuserDialog] = useState(false);
  const [deleteUsuarioDialog, setDeleteUsuarioDialog] = useState(false);
  const [deleteUsuariosDialog, setDeleteUsuariosDialog] = useState(false);

  const cols = [
    { field: "id", header: "ID" },
    { field: "name", header: "Nombre" },
    { field: "age", header: "Edad" },
    { field: "address", header: "Dirección" },
  ];
  const exportColumns = cols.map((col) => ({
    title: col.header,
    dataKey: col.field,
  }));

  const fetchUsuarios = async () => {
    //Funcion asyncrona para obtener los datos de la tabla Usuarios
    const { data, error } = await supabase.from("Usuarios").select(); //Constante de data y error que es un await, es decir espera a que reciba una respuesta de la variable supabase, de la tabla "Uusarios" y hace un select de toda la tabla
    console.log(error ? "Error:" : "Datos:", error || data); //YUn console log que nos dice si hay un error o si se obtuvieron los datos
    setUsuarios(data || []); //Setea la variable Usuarios con los datos obtenidos o un array vacio si no se obtuvieron datos
  };

  useEffect(() => {
    //Este useEffect es un hook para que solo se ejecute una sola vez al cargar la pagina
    fetchUsuarios(); //Ejecuta la funcion fetchUsuarios que obtiene los datos de la tabla Usuarios
  }, []);

  const insertUsuario = async (e) => {
    //Funcion asyncrona para obtener los datos de la tabla Usuarios
    // e.preventDefault();
    const { data, error } = await supabase
      .from("Usuarios")
      .insert({ name, age, address }); //Constante de data y error que es un await, es decir espera a que reciba una respuesta de la variable supabase, de la tabla "Uusarios" y hace un select de toda la tabla
    console.log(error ? "Error:" : "Datos:", error || data); //YUn console log que nos dice si hay un error o si se obtuvieron los datos
    console.log(data);
    setName("");
    setAge("");
    setAddress("");
    fetchUsuarios();
    toast.current.show({
      severity: "success",
      summary: "Exitoso",
      detail: "Usuario Agregado",
      life: 3000,
    });
  };

  //Inicio de editor de tabla
  const onRowEditComplete = async (e) => {
    const { newData } = e; // Obtén los datos de la fila y el índice
    const { id, name, age, address } = newData; // Extrae los valores de la fila
    console.log(newData);
    const { error } = await supabase
      .from("Usuarios")
      .update({ name, age, address })
      .eq("id", id);
    if (error) {
      console.error("Error al actualizar:", error.message);
    } else {
      console.log(`Fila con ID ${id} actualizada correctamente.`);
    }
    setUsuarios(
      Usuarios.map((usuario) => (usuario.id === id ? newData : usuario))
    ); // Actualiza el estado de la fila editada SOLO LA FILA
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
  const allowEdit = (rowData) => {
    return rowData.name !== "Blue Band";
  };

  //Fin de editor de tabla

  const saveuser = async () => {
    setSubmitted(true);

    if (user.name.trim()) {
      try {
        const _user = { ...user };

        let actionMessage = "";

        // Si el usuario tiene un ID, actualizamos el registro, si no, lo insertamos
        if (user.id) {
          const { data, error } = await supabase
            .from("Usuarios")
            .update({
              name: user.name,
              age: user.age,
              address: user.address,
            })
            .eq("id", user.id);

          if (error) {
            console.error("Error actualizando:", error.message);
            toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "No se pudo actualizar el usuario",
              life: 3000,
            });
          } else {
            actionMessage = "Usuario Actualizado";
            console.log(`data actualizada ` + data);
          }
        } else {
          //lo de aqui para arriba tecnicamente no sirve porque el id es automatico

          const { data, error } = await supabase.from("Usuarios").insert([
            {
              name: user.name,
              age: user.age,
              address: user.address,
            },
          ]);

          if (error) {
            console.error("Error insertando:", error.message);
            toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "No se pudo crear el usuario",
              life: 3000,
            });
          } else {
            actionMessage = "Usuario Creado";
          }
        }

        // Mostrar mensaje de éxito
        toast.current.show({
          severity: "success",
          summary: "Exitoso",
          detail: actionMessage,
          life: 3000,
        });

        // Resetear el estado de los campos
        setUser(emptyUser);
        setuserDialog(false);
        fetchUsuarios(); // Refrescar lista de usuarios
      } catch (error) {
        console.error("Error en la operación:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Ocurrió un error inesperado",
          life: 3000,
        });
      }
    }
  };

  //inicio de eliminar usuario
  const deleteSelectedUsuarios = async () => {
    let actionMessage = "";
    const selectedIds = selectedUsuarios.map((usuario) => usuario.id); // Obtener los IDs de los usuarios seleccionados del array

    try {
      // Realizar la eliminación en Supabase con un array de IDs
      const { data, error } = await supabase
        .from("Usuarios")
        .delete()
        .in("id", selectedIds); // Usamos `.in` para eliminar varios IDs

      if (error) {
        console.error("Error eliminando:", error.message);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron eliminar los usuarios",
          life: 3000,
        });
      } else {
        actionMessage = "Usuarios Eliminados";
        console.log("Usuarios eliminados:", data);
      }
      // Mostrar mensaje de éxito
      toast.current.show({
        severity: "success",
        summary: "Exitoso",
        detail: actionMessage,
        life: 3000,
      });
      hideDeleteUsuariosDialog(); // Cerrar el diálogo de confirmación
      // Refrescar la lista de usuarios
      fetchUsuarios(); // Refrescar lista de usuarios
    } catch (error) {
      console.error("Error en la eliminación:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Ocurrió un error al eliminar los usuarios",
        life: 3000,
      });
    }
  };

  const hideDeleteUsuariosDialog = () => {
    setDeleteUsuariosDialog(false);
  };

  const confirmDeleteSelected = () => {
    setDeleteUsuariosDialog(true);
  };

  const deleteUsuariosDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteUsuariosDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteSelectedUsuarios}
      />
    </React.Fragment>
  );

  //fin de eliminar usuario

  const exportCSV = () => {
    //Funcion para exportar la tabla a un archivo CSV (excel)
    dt.current.exportCSV();
  };

  const exportPdf = () => {
    //Funcion para exportar la tabla a un archivo PDF
    import("jspdf").then((jsPDF) => {
      import("jspdf-autotable").then(() => {
        const doc = new jsPDF.default(0, 0);

        doc.autoTable(exportColumns, Usuarios);
        doc.save("products.pdf");
      });
    });
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
    let _user = { ...user };

    // Actualizar el valor de la propiedad correspondiente
    _user[`${name}`] = val;

    // Actualizar el estado del usuario
    setUser(_user);
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="New"
          icon="pi pi-plus"
          severity="success"
          onClick={openNew}
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          onClick={confirmDeleteSelected}
          disabled={!selectedUsuarios || !selectedUsuarios.length}
        />
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
      <h4 className="m-0">Manage Usuarios</h4>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
        />
      </IconField>
    </div>
  );

  const openNew = () => {
    setUser(emptyUser);
    setSubmitted(false);
    setuserDialog(true);
  };
  const hideDialog = () => {
    setSubmitted(false);
    setuserDialog(false);
  };

  const userDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" onClick={saveuser} />
    </React.Fragment>
  );

  return (
    <>
      <Toast ref={toast} />
      <h1>Lista de Usuarios</h1>
      <div className="card">
        <Toolbar
          className="mb-4"
          left={leftToolbarTemplate}
          right={rightToolbarTemplate}
        ></Toolbar>

        <DataTable
          editMode="row"
          onRowEditComplete={onRowEditComplete}
          ref={dt}
          value={Usuarios}
          selection={selectedUsuarios}
          onSelectionChange={(e) => setSelectedUsuarios(e.value)}
          onRowEditInit={(e) => setUser(e.data)}
          onRowEditCancel={(e) => console.log(e)}
          className="p-datatable-gridlines"
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
            style={{ minWidth: "12rem" }}
          ></Column>
          <Column
            field="name"
            header="Nombre"
            editor={(options) => textEditor(options)}
            sortable
            style={{ minWidth: "16rem" }}
          ></Column>
          <Column
            field="age"
            header="Edad"
            editor={(options) => numberEditor(options)}
            sortable
            style={{ minWidth: "12rem" }}
          ></Column>
          <Column
            field="address"
            header="Dirección"
            editor={(options) => textEditor(options)}
            sortable
            style={{ minWidth: "16rem" }}
          ></Column>
          <Column
            header="Herramientas"
            rowEditor={allowEdit}
            headerStyle={{ width: "10%", minWidth: "8rem" }}
            bodyStyle={{ textAlign: "center" }}
          ></Column>
        </DataTable>
      </div>

      <Dialog
        visible={userDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Nuevo Usuario"
        modal
        className="p-fluid"
        footer={userDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="Nombre" className="font-bold">
            Nombre
          </label>
          <InputText
            id="name"
            value={Usuarios.name}
            onChange={(e) => onInputChange(e, "name")}
            required
            autoFocus
          />
          <br />
          {submitted && !Usuarios.name && (
            <small className="p-error">Nombre es Requerido.</small>
          )}

          <label htmlFor="Edad" className="font-bold">
            Edad
          </label>
          <InputText
            type="number"
            id="age"
            value={Usuarios.age}
            onChange={(e) => onInputChange(e, "age")}
          />
          <br />
          {submitted && !Usuarios.age && (
            <small className="p-error" required>
              Edad es Requerida.
            </small>
          )}

          <label htmlFor="Dirección" className="font-bold">
            Dirección
          </label>
          <InputText
            id="address"
            value={Usuarios.address}
            onChange={(e) => onInputChange(e, "address")}
            required
          />
          <br />
          {submitted && !Usuarios.address && (
            <small className="p-error">Dirección es Requerida.</small>
          )}
        </div>
      </Dialog>

      <Dialog
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
      </Dialog>

      <Dialog
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
      </Dialog>
    </>
  );
}
export default FetchData;
