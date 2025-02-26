import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ControlOperativoHornoMultilevel.css"; // Importa el CSS
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

const ControlOperativoHornoMultilevel = () => {

    let emptyRegister = {
        d_voltaje: "",
        d_amperaje: "",
        temp_seteada: "",
        temp_real: "",
        salida1: "",
        salida2: "",
        entrada1: "",
        entrada2: "",


        kpa_manometro1: "",
        kpa_manometro2: "",
        kpa_manometro3: "",
        kpa_manometro4: "",


        banda_alimentacion1: "",
        banda_alimentacion2: "",
        banda_alimentacion3: "",

        psi_tanque1: "",
        psi_tanque2: "",
        psi_tanque3: "",

        fec_registro: "",
        hor_registro: "",
        observaciones: "",
        hor_inicio: "",
        hor_fin: "",
        tipo_control: ""
    };
    
}
export default ControlOperativoHornoMultilevel;