import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./GestionUsuarios.css"; // Estilos de la tabla
import supabase from "../../../supabaseClient"; // Conexión a Supabase
import "primereact/resources/themes/lara-light-indigo/theme.css"; // Tema
import "primeicons/primeicons.css"; // Íconos
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import logo2 from "../../../assets/mosca.png";

function GestionUsuarios() {
  // Estado inicial de un usuario vacío
  const emptyUser = {
    //id: null,
    username: "",
    password: "",
    departamento: "",
  };

  const [usuarios, setUsuarios] = useState([]); // Estado para almacenar los usuarios
  const [usuario, setUsuario] = useState(emptyUser); // Estado para el usuario actual
  const toast = useRef(null); // Referencia para mostrar mensajes emergentes
  const [selectedUsuario, setSelectedUsuario] = useState(null); // Estado para el usuario seleccionado
  const [globalFilter, setGlobalFilter] = useState(null); // Estado para el filtro global
  const [submitted, setSubmitted] = useState(false); // Estado para controlar el envío del formulario
  const [usuarioDialog, setUsuarioDialog] = useState(false); // Estado para mostrar/ocultar el diálogo de usuario
  const [deleteUsuarioDialog, setDeleteUsuarioDialog] = useState(false); // Estado para mostrar/ocultar el diálogo de eliminación
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña
  const navigate = useNavigate(); // Navegación

  // Opciones de departamento
  const departamentos = [
    { name: "Dieta", value: "Dieta" },
    { name: "Hatchery", value: "Hatchery" },
    { name: "Horno", value: "Horno" },
    { name: "Cosecha", value: "Cosecha" },
    { name: "Empaque", value: "Empaque" },
    { name: "Mantenimiento", value: "Mantenimiento" },
    { name: "Calidad", value: "Calidad" },
    { name: "Gerencia", value: "Gerencia" },
  ];

  // Fetch de usuarios desde Supabase
  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase.from("Usuarios").select();
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error.message);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar los usuarios",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchUsuarios(); // Cargar usuarios al montar el componente
  }, []);

  // Guardar o actualizar un usuario
  const saveUsuario = async () => {
    setSubmitted(true);
  
    // Validar campos obligatorios
    if (!usuario.username || !usuario.password || !usuario.departamento) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Todos los campos son obligatorios",
        life: 3000,
      });
      return;
    }
  
    try {
      if (usuario.id) {
        // Actualizar usuario existente
        const { error } = await supabase
          .from("Usuarios")
          .update(usuario)
          .eq("id", usuario.id);
        if (error) throw error;
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Usuario actualizado correctamente",
          life: 3000,
        });
      } else {
        // Crear nuevo usuario sin asignar un id manualmente
        const { error } = await supabase.from("Usuarios").insert([{
          
          username: usuario.username,
          password: usuario.password,
          departamento: usuario.departamento
        }]);
        if (error) throw error;
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Usuario creado correctamente",
          life: 3000,
        });
      }
  
      setUsuarioDialog(false); // Cerrar diálogo
      setUsuario(emptyUser); // Reiniciar estado del usuario
      fetchUsuarios(); // Recargar lista de usuarios
    } catch (error) {
      console.error("Error al guardar usuario:", error.message);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Ocurrió un error al guardar el usuario",
        life: 3000,
      });
    }
  };

  // Eliminar un usuario
  const deleteUsuario = async () => {
    if (!usuario.id) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se ha seleccionado un usuario válido para eliminar",
        life: 3000,
      });
      return;
    }
  
    try {
      const { error } = await supabase
        .from("Usuarios")
        .delete()
        .eq("id", usuario.id);
      if (error) throw error;
      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Usuario eliminado correctamente",
        life: 3000,
      });
      setDeleteUsuarioDialog(false); // Cerrar diálogo
      fetchUsuarios(); // Recargar lista de usuarios
    } catch (error) {
      console.error("Error al eliminar usuario:", error.message);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Ocurrió un error al eliminar el usuario",
        life: 3000,
      });
    }
  };

  // Confirmar eliminación de un usuario
  const confirmDeleteUsuario = (usuario) => {
    setUsuario(usuario);
    setDeleteUsuarioDialog(true);
  };

  // Plantilla del toolbar
  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Nuevo"
          icon="pi pi-plus"
          severity="success"
          onClick={() => {
            setUsuario(emptyUser);
            setUsuarioDialog(true);
          }}
        />
        <Button
          label="Eliminar"
          icon="pi pi-trash"
          severity="danger"
          onClick={() => confirmDeleteUsuario(selectedUsuario)}
          disabled={!selectedUsuario}
        />
      </div>
    );
  };

  // Diálogo de usuario
  const usuarioDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        outlined
        onClick={() => setUsuarioDialog(false)}
      />
      <Button label="Guardar" icon="pi pi-check" onClick={saveUsuario} />
    </React.Fragment>
  );

  // Diálogo de confirmación de eliminación
  const deleteUsuarioDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={() => setDeleteUsuarioDialog(false)}
      />
      <Button
        label="Sí"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteUsuario}
      />
    </React.Fragment>
  );

  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="gestion-usuarios-container">
      <Toast ref={toast} />
      <h1>
        <img src={logo2} alt="mosca" className="logo2" />
        Gestión de Usuarios
      </h1>
      <div className="welcome-message">
          <p>
            Bienvenido al sistema de Gestión de Usuarios el cualpermite administrar 
            de manera eficiente los usuarios registrados en el sistema. Desde esta interfaz,
            puedes agregar nuevos usuarios, editar la información de usuarios existentes y 
            eliminar usuarios que ya no requieran acceso.
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
      <Toolbar className="mb-4" left={leftToolbarTemplate} />
      <DataTable
        value={usuarios}
        selection={selectedUsuario}
        onSelectionChange={(e) => {
          // Si la fila seleccionada ya está seleccionada, la deseleccionamos
          if (selectedUsuario && selectedUsuario.id === e.value.id) {
            setSelectedUsuario(null);
          } else {
            setSelectedUsuario(e.value);
          }
        }}
        dataKey="id"
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
        globalFilter={globalFilter}
        header={
          <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                type="search"
                onInput={(e) => setGlobalFilter(e.target.value)}
                placeholder="Buscador Global..."
              />
            </span>
          </div>
        }
      >
        <Column selectionMode="single" exportable={false} />
        <Column field="username" header="Nombre de Usuario" sortable />
        <Column field="departamento" header="Departamento" sortable />
        <Column
          body={(rowData) => (
            <div className="actions">
              <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-success mr-2"
                onClick={() => {
                  setUsuario(rowData);
                  setUsuarioDialog(true);
                }}
              />
            </div>
          )}
          header="Acciones"
          style={{ minWidth: "8rem" }}
        />
      </DataTable>

      {/* Diálogo para agregar/editar usuario */}
      <Dialog
        visible={usuarioDialog}
        style={{ width: "450px" }}
        header="Detalles del Usuario"
        modal
        className="p-fluid"
        footer={usuarioDialogFooter}
        onHide={() => {
          setUsuarioDialog(false);
          setShowPassword(false); // Ocultar la contraseña al cerrar el diálogo
        }}
      >
        <div className="field">
          <label htmlFor="username">Nombre de Usuario</label>
          <InputText
            id="username"
            value={usuario.username}
            onChange={(e) =>
              setUsuario({ ...usuario, username: e.target.value })
            }
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <div className="p-inputgroup">
            <InputText
              id="password"
              type={showPassword ? "text" : "password"}
              value={usuario.password}
              onChange={(e) =>
                setUsuario({ ...usuario, password: e.target.value })
              }
              required
            />
            <Button
              icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
              className="p-button-text"
              onClick={togglePasswordVisibility}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="departamento">Departamento</label>
          <Dropdown
            id="departamento"
            value={usuario.departamento}
            options={departamentos}
            onChange={(e) =>
              setUsuario({ ...usuario, departamento: e.value })
            }
            optionLabel="name"
            placeholder="Seleccione un departamento"
          />
        </div>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog
        visible={deleteUsuarioDialog}
        style={{ width: "450px" }}
        header="Confirmar"
        modal
        footer={deleteUsuarioDialogFooter}
        onHide={() => setDeleteUsuarioDialog(false)}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {usuario && (
            <span>
              ¿Estás seguro de que deseas eliminar al usuario{" "}
              <b>{usuario.username}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
}

export default GestionUsuarios;