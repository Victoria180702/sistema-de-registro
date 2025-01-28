import React, { useEffect, useState, ordenef, useRef } from "react";
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
import { Dropdown } from "primereact/dropdown";

function OrdenesFetch() {
  let emptyorden = {
    id: null,
    name: "",
    type: "",
    status: "",
    createdtime: "",
  };

  const [Ordenes, setOrdenes] = useState([]);
  const [orden, setorden] = useState(emptyorden);
  const [type, setType] = useState("");
  const [status, setStatus] = useState(false);
  const toast = useRef(null);
  const dt = useRef(null);
  const [selectedOrdenes, setSelectedOrdenes] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [ordenDialog, setordenDialog] = useState(false);
  const [deleteOrdenDialog, setDeleteOrdenDialog] = useState(false);
  const [deleteOrdenesDialog, setDeleteOrdenesDialog] = useState(false);
  

  const cols = [
    { field: "id", header: "ID" },
    { field: "name", header: "Nombre" },
    { field: "type", header: "Tipo" },
    { field: "status", header: "Construcción" },
    { field: "createddate", header: "Fecha de Registro" },
    { field: "createdtime", header: "Hora de Registro" },
    { field: "SKU", header: "Lote" },
  ];
  const tiposOrdenes = [
    { name: "Orden Tipo A", value: "OPC A" },
    { name: "Orden Tipo B", value: "OPC B" },
    { name: "Orden Tipo C", value: "OPC C" },
  ];

  const estados = [
    { name: "En Proceso", value: "En Proceso" },
    { name: "Concluida", value: "concluida" },
  ];
  const exportColumns = cols.map((col) => ({
    title: col.header,
    dataKey: col.field,
  }));

  const fetchOrdenes = async () => {
    //Funcion asyncrona para obtener los datos de la tabla Ordenes
    const { data, error } = await supabase.from("Ordenes").select(); //Constante de data y error que es un await, es decir espera a que reciba una respuesta de la variable supabase, de la tabla "Uusarios" y hace un select de toda la tabla
    console.log(error ? "Error:" : "Datos:", error || data); //YUn console log que nos dice si hay un error o si se obtuvieron los datos
    setOrdenes(data || []); //Setea la variable Ordenes con los datos obtenidos o un array vacio si no se obtuvieron datos
  };

  useEffect(() => {
    //Este useEffect es un hook para que solo se ejecute una sola vez al cargar la pagina
    fetchOrdenes(); //Ejecuta la funcion fetchOrdenes que obtiene los datos de la tabla Ordenes
  }, []);


  //Inicio de editor de tabla
  const onRowEditComplete = async (e) => {
    const { newData } = e; // Obtén los datos de la fila y el índice
    const { name, type, status } = newData; // Extrae los valores de la fila
    const { error } = await supabase
      .from("Ordenes")
      .update({ name, type, status }) // Actualiza los datos de la fila
      .eq("id", newData.id); // Donde el ID sea igual al ID de la fila
    if (error) {
      console.error("Error al actualizar:", error.message);
    } else {
      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Orden actualizado",
        life: 3000,
      });
    }
    setOrdenes(Ordenes.map((Orden) => (Orden.id === newData.id ? newData : Orden))); // Actualiza el estado de la fila editada SOLO LA FILA
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

  //Fin de editor de tabla

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

  const saveorden = async () => {
    setSubmitted(true);

    if (orden.name.trim()) {
      try {
        const _orden = { ...orden };

        let actionMessage = "";

        // Si el Orden tiene un ID, actualizamos el registro, si no, lo insertamos
        if (orden.id) {
          const { data, error } = await supabase
            .from("Ordenes")
            .update({
              name: orden.name,
              type: orden.type,
              status: orden.status,
              createddate: orden.createddate,
              createdtime: orden.createdtime,
              SKU: orden.SKU,
            })
            .eq("id", orden.id);

          if (error) {
            console.error("Error actualizando:", error.message);
            toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "No se pudo actualizar el Orden",
              life: 3000,
            });
          } else {
            actionMessage = "Orden Actualizado";
          }
        } else {
          //lo de aqui para arriba tecnicamente no sirve porque el id es automatico

          const { data, error } = await supabase.from("Ordenes").insert([
            {
              name: orden.name,
              type: orden.type,
              status: orden.status,
              createddate: orden.createddate,
              createdtime: orden.createdtime,
              SKU: orden.SKU,
            },
          ]);

          if (error) {
            console.error("Error insertando:", error.message);
            toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "No se pudo crear el Orden",
              life: 3000,
            });
          } else {
            actionMessage = "Orden Creado";
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
        setorden(emptyorden);
        setordenDialog(false);
        fetchOrdenes(); // Refrescar lista de Ordenes
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

  //inicio de eliminar Orden
  const deleteSelectedOrdenes = async () => {
    let actionMessage = "";
    const selectedIds = selectedOrdenes.map((Orden) => Orden.id); // Obtener los IDs de los Ordenes seleccionados del array

    try {
      // Realizar la eliminación en Supabase con un array de IDs
      const { data, error } = await supabase
        .from("Ordenes")
        .delete()
        .in("id", selectedIds); // Usamos `.in` para eliminar varios IDs

      if (error) {
        console.error("Error eliminando:", error.message);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron eliminar los Ordenes",
          life: 3000,
        });
      } else {
        actionMessage = "Ordenes Eliminados";
      }
      // Mostrar mensaje de éxito
      toast.current.show({
        severity: "success",
        summary: "Exitoso",
        detail: actionMessage,
        life: 3000,
      });
      hideDeleteOrdenesDialog(); // Cerrar el diálogo de confirmación
      // Refrescar la lista de Ordenes
      fetchOrdenes(); // Refrescar lista de Ordenes
    } catch (error) {
      console.error("Error en la eliminación:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Ocurrió un error al eliminar los Ordenes",
        life: 3000,
      });
    }
  };

  const hideDeleteOrdenesDialog = () => {
    setDeleteOrdenesDialog(false);
  };

  const confirmDeleteSelected = () => {
    setDeleteOrdenesDialog(true);
  };

  const deleteOrdenesDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteOrdenesDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteSelectedOrdenes}
      />
    </React.Fragment>
  );

  //fin de eliminar Orden
  // const exportCSV = () => {
  //   dt.current.exportCSV()
  // };

  const exportPdf = () => {
    //Funcion para exportar la tabla a un archivo PDF
    import("jspdf").then((jsPDF) => {
      import("jspdf-autotable").then(() => {
        const doc = new jsPDF.default(0, 0);
        console.log(selectedOrdenes);

        doc.autoTable(exportColumns, selectedOrdenes);
        doc.save("Ordenes.pdf");
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
    // Obtener la fecha y hora actual
    const currentDate = formatDateTime(new Date(), "DD-MM-YYYY"); // Solo fecha
    const currentTime = formatDateTime(new Date(), "hh:mm A"); // Fecha en formato ISO 8601
    const SKU = `RO${formatDateTime(new Date(), "DDMMYYYY")}`
    // Crear una copia del estado de 'orden'
    let _orden = { ...orden };

    // Actualizar el valor de la propiedad correspondiente
    _orden[name] = val;

    // Agregar la fecha y hora actual al estado
    _orden["createddate"] = currentDate;
    _orden["createdtime"] = currentTime;
    _orden["SKU"] = SKU;
    // Actualizar el estado del Orden

    setorden(_orden);
  };

  const onDropdownChange = (e, name) => {
    const val = e.value;
    console.log(`${name}: ${val}`); // Depura el valor seleccionado
  
    setorden((prevOrdenes) => ({
      ...prevOrdenes,
      [name]: val, // Guarda el valor seleccionado
    }));
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
          disabled={!selectedOrdenes || !selectedOrdenes.length}
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
        disabled={!selectedOrdenes || !selectedOrdenes.length}
      />
    );
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Manage Ordenes</h4>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e) => {setGlobalFilter(e.target.value); console.log(e.target.value)}}
          placeholder="Search..."
        />
      </IconField>
    </div>
  );

  const openNew = () => {
    setorden(emptyorden);
    setSubmitted(false);
    setordenDialog(true);
  };
  const hideDialog = () => {
    setSubmitted(false);
    setordenDialog(false);
  };

  const ordenDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" onClick={saveorden} />
    </React.Fragment>
  );

  return (
    <>
      <Toast ref={toast} />
      <h1>Lista de Ordenes</h1>
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
          value={Ordenes}
          selection={selectedOrdenes}
          onSelectionChange={(e) => setSelectedOrdenes(e.value)}
          onRowEditInit={(e) => setorden(e.data)}
          onRowEditCancel={(e) => console.log(e)}
          className="p-datatable-gridlines"
          style={{ width: "100%" }}
          dataKey="id"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Ordenes"
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
            field="type"
            header="Tipo"
            editor={(options) => DropdownEditor(options, tiposOrdenes)}
            sortable
            style={{ minWidth: "12rem" }}
          ></Column>
          <Column
            field="status"
            header="Construcción"
            editor={(options) => DropdownEditor(options, estados)}
            sortable
            style={{ minWidth: "16rem" }}
          ></Column>
          <Column
            field="createddate"
            header="Fecha de Registro"
            // editor={(options) => textEditor(options)}
            sortable
            style={{ minWidth: "16rem" }}
          ></Column>
          <Column
            field="createdtime"
            header="Hora de Registro"
            // editor={(options) => textEditor(options)}
            sortable
            style={{ minWidth: "16rem" }}
          ></Column>
          <Column
            field="SKU"
            header="Lote"
            // editor={(options) => textEditor(options)}
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
        visible={ordenDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Nuevo Orden"
        modal
        className="p-fluid"
        footer={ordenDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="Nombre" className="font-bold">
            Nombre
          </label>
          <InputText
            id="name"
            value={Ordenes.name}
            onChange={(e) => onInputChange(e, "name")}
            required
            autoFocus
          />
          {submitted && !Ordenes.name && (
            <small className="p-error">Nombre es Requerido.</small>
          )}
          <br />
          <label htmlFor="Tipo" className="font-bold">
            Tipo
          </label>
          <Dropdown
            value={type || null} // Asegúrate de que sea null o coincida con un valor válido
            onChange={(e) => {setType(e.value);onDropdownChange(e, "type")}}
            options={tiposOrdenes}
            optionLabel="name"
            optionValue="value" // Define el valor identificador
            placeholder="Select a type"
            className="w-full md:w-14rem"
            checkmark={true}
            highlightOnSelect={false}
            
          />
          {/* <Dropdown value={type} onChange={(e)=>{setType(e.value);onDropdownChange(e, "type")}} options={tiposOrdenes} optionLabel="name" 
                editable placeholder="Select a City" className="w-full md:w-14rem" />
         */}
          {submitted && !type && (
            <small className="p-error" required>
              Tipo es Requerida.
            </small>
          )}
          
          <br />
          <label htmlFor="Construcción" className="font-bold">
            Construcción
          </label>
          <Dropdown
            value={status}
            onChange={(e) => {setStatus(e.value);onDropdownChange(e, "status")}}
            options={estados}
            optionLabel="name"
            placeholder="Select a status"
            className="w-full md:w-14rem"
            checkmark={true}
            highlightOnSelect={false}
          />
          {submitted && !status && (
            <small className="p-error" required>
              Construcción es Requerida.
            </small>
          )}
          <br />
        </div>
      </Dialog>

      <Dialog
        visible={deleteOrdenDialog}
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
          {orden && (
            <span>
              Estas seguro que deseas eliminar el Orden: <b>{orden.name}</b>?
            </span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={deleteOrdenesDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteOrdenesDialogFooter}
        onHide={hideDeleteOrdenesDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {orden && (
            <span>
              ¿Estas seguro que quieres eliminar los Ordenes seleccionados?
            </span>
          )}
        </div>
      </Dialog>
    </>
  );
}
export default OrdenesFetch;
