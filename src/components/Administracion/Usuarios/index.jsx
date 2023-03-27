import { Button } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { config } from "../../../config";
import CustomRecordViewer from "../../common/CustomRecordViewer/RecordViewer";
import { actions, headers } from "./usuario.config";

const Usuarios = () => {
  const navigate = useNavigate();
  const apiGetUsuarios = config.API_URL.concat("Usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [loadingInternal, setLoadingInternal] = useState(false);
  const location = useLocation();

  const onActionClick = (action, row) => {
    switch (action) {
      case "detalle":
        VerOEditarUsuario(row, true);
        break;
      case "editar":
        VerOEditarUsuario(row, false);
        break;
      case "eliminar":
        EliminarUsuario(row.id);
        break;
      default:
        break;
    }
  };

  const EliminarUsuario = async (id) => {
    Swal.fire({
      title: 'Usuarios',
      text: '¿Esta seguro de eliminar este usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then( async (result) => {
      if(result.isConfirmed){
        try {
          await axios.delete(apiGetUsuarios.concat("/" + id)).then(() => {
            Swal.fire('', 'El usuario ha sido eliminado con éxito.', 'success').then(() => {
              ObtenerUsuarios();
            });
          });
        } catch (error) {
          console.error(error);
          Swal.fire('', 'Ha ocurrido un error inesperado', 'error');
        }
      }
    })

  };

  const VerOEditarUsuario = (row, detalle) => {
    navigate("./form", {
      state: {
        modelo: row,
        isDetalle: detalle
      },
    });
  };

  const ObtenerUsuarios = async () => {
    setLoadingInternal(true);
    await axios.get(apiGetUsuarios)
      .then(res => {
        setUsuarios(res.data);
        setLoadingInternal(false);
      }).catch(err => {
        console.log(err);
        setLoadingInternal(false);
      })
    // if (!data.empty) {
    //   setUsuarios(data.docs.map((doc) => ({ idDoc: doc.id, ...doc.data() })));
    // } else {
    //   setUsuarios([]);
    // }
  };

  useEffect(() => {
    ObtenerUsuarios();
  }, []);

  useEffect(() => {
    if (location.state) {
      if (location.state.refetch === true) {
        ObtenerUsuarios();
      }
    }
  }, [location.state]);

  return (
    <>
      <div style={{ width: "82vw" }}>
        <CustomRecordViewer
          data={usuarios}
          columns={headers}
          textoBotonAdd={"Agregar usuario"}
          actions={actions}
          onActionClick={onActionClick}
          loading={loadingInternal}
        />
      </div>
    </>
  );
};

export default Usuarios;
