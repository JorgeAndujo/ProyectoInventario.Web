import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { config } from "../../../config";
import CustomRecordViewer from "../../common/CustomRecordViewer/RecordViewer";
import { actions, headers } from "./proveedor.config";

const Proveedores = () => {
  const navigate = useNavigate();
  const apiProveedor = config.API_URL.concat("Proveedores");
  const [proveedores, setProveedores] = useState([]);
  const [listaProveedores, setListaProveedores] = useState([]);
  const [loadingInternal, setLoadingInternal] = useState(false);
  const location = useLocation();

  const onActionClick = (action, row) => {
    switch (action) {
      case "detalle":
        VerOEditarProveedor(row, true);
        break;
      case "editar":
        VerOEditarProveedor(row, false);
        break;
      case "eliminar":
        EliminarProveedor(row.id);
        break;
      default:
        break;
    }
  };

  const EliminarProveedor = async (id) => {
    Swal.fire({
      title: 'Usuarios',
      text: '¿Esta seguro de eliminar este proveedor?',
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
          await axios.delete(apiProveedor.concat("/" + id)).then(() => {
            Swal.fire('', 'El proveedor ha sido eliminado con éxito.', 'success').then(() => {
                ObtenerProveedores();
            });
          });
        } catch (error) {
          console.error(error);
          Swal.fire('', 'Ha ocurrido un error inesperado', 'error');
        }
      }
    })

  };

  const VerOEditarProveedor = (row, detalle) => {
    navigate("./form", {
      state: {
        modelo: row,
        isDetalle: detalle
      },
    });
  };

  const ObtenerProveedores = async () => {
    setLoadingInternal(true);
    await axios.get(apiProveedor)
      .then(res => {
        setProveedores(res.data);
        setListaProveedores(res.data);
        setLoadingInternal(false);
      }).catch(err => {
        console.log(err);
        setLoadingInternal(false);
      })
  };

  const BuscarProveedor = (term) => {
    var filtro = proveedores?.filter(
      (x) =>
        x.razonSocial?.toLowerCase().includes(term.toLowerCase()) ||
        x.correo?.toLowerCase().includes(term.toLowerCase()) ||
        x.rfc?.toLowerCase().includes(term.toLowerCase())
    );
    setListaProveedores(filtro);
  };

  useEffect(() => {
    ObtenerProveedores();
  }, []);

  useEffect(() => {
    if (location.state) {
      if (location.state.refetch === true) {
        ObtenerProveedores();
      }
    }
  }, [location.state]);

  return (
    <>
      <div style={{ width: "82vw" }}>
        <CustomRecordViewer
          data={listaProveedores}
          columns={headers}
          textoBotonAdd={"Agregar proveedor"}
          actions={actions}
          onActionClick={onActionClick}
          loading={loadingInternal}
          setSearchTerm={(term) => BuscarProveedor(term)}
        />
      </div>
    </>
  );
};

export default Proveedores;
