import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { config } from "../../../config";
import CustomRecordViewer from "../../common/CustomRecordViewer/RecordViewer";
import { actions, headers } from "./producto.config";

const Productos = () => {
  const navigate = useNavigate();
  const apiUrl = config.API_URL.concat("Productos");
  const [productos, setProductos] = useState([]);
  const [listaProductos, setListaProductos] = useState([]);
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
      title: "Usuarios",
      text: "¿Esta seguro de eliminar este usuario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(apiUrl.concat("/" + id)).then(() => {
            Swal.fire(
              "",
              "El producto ha sido eliminado con éxito.",
              "success"
            ).then(() => {
              ObtenerProductos();
            });
          });
        } catch (error) {
          console.error(error);
          Swal.fire("", "Ha ocurrido un error inesperado", "error");
        }
      }
    });
  };

  const VerOEditarUsuario = (row, detalle) => {
    navigate("./form", {
      state: {
        modelo: row,
        isDetalle: detalle,
      },
    });
  };

  const ObtenerProductos = async () => {
    setLoadingInternal(true);
    await axios
      .get(apiUrl)
      .then((res) => {
        setProductos(res.data);
        setListaProductos(res.data);
        setLoadingInternal(false);
      })
      .catch((err) => {
        console.log(err);
        setLoadingInternal(false);
      });
  };

  const _buscarProducto = (term) => {
    var filtro = productos?.filter(
      (x) =>
        x.nombre?.toLowerCase().includes(term.toLowerCase()) ||
        x.clave?.toLowerCase().includes(term.toLowerCase()) ||
        x.marca?.toLowerCase().includes(term.toLowerCase())
    );
    setListaProductos(filtro);
  };

  useEffect(() => {
    ObtenerProductos();
  }, []);

  useEffect(() => {
    if (location.state) {
      if (location.state.refetch === true) {
        ObtenerProductos();
      }
    }
  }, [location.state]);

  return (
    <>
      <div style={{ width: "82vw" }}>
        <CustomRecordViewer
          data={listaProductos?.map((x) => ({
            ...x,
          }))}
          columns={headers}
          textoBotonAdd={"Agregar producto"}
          actions={actions}
          setSearchTerm={(term) => _buscarProducto(term)}
          onActionClick={onActionClick}
          loading={loadingInternal}
        />
      </div>
    </>
  );
};

export default Productos;
