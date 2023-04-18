import { Button, Col, Form, Input, Row, Select, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { ListaRoles } from "../../pipes/enums";
import { useEffect, useState } from "react";
import generateGuid from "../../../utils/generateGuid";
import Swal from "sweetalert2";
import { config, formatosValidosFotoPerfil } from "../../../config";
import axios from "axios";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../../../firebase/config";
import TextArea from "antd/es/input/TextArea";
import { ProveedorFormSelect } from "../../common/Selects/ProveedorSelect";

const FormUsuarios = () => {
  const navigate = useNavigate();
  const [datosProducto] = Form.useForm();
  const [loadingInternal, setLoadingInternal] = useState(false);
  const apiURL = config.API_URL;
  const [image, setImage] = useState(null);
  const location = useLocation();
  const [producto, setProducto] = useState(null);
  const [isDetalle, setIsDetalle] = useState(false);
  const ImgLabel = "Seleccionar Imagen";

  const onFinish = async (values) => {
    setLoadingInternal(true);
    const prod = location?.state?.modelo;
    if (prod != null) {
      try {
        await axios
          .put(apiURL.concat("Productos/" + prod.id), {
            id: prod.id,
            activo: true,
            nombre: values.nombre,
            clave: values.clave,
            marca: values.marca,
            descripcion: values.descripcion,
            fechaCreacion: prod.fechaCreacion,
            fechaActualizacion: new Date(),
            urlImagen: null,
            proveedorId: values.proveedorId,
          })
          .then(async (res) => {
            if (
              image !== null &&
              image !== undefined &&
              image !== prod.urlImagen
            ) {
              try {
                await UploadImage(image, prod.id);
              } catch (error) {
                console.error(error);
                Swal.fire(
                  "Advertencia",
                  "Ha ocurrido un error al subir la foto de perfil.",
                  "error"
                );
              }
            } else {
              if (
                prod.urlImagen !== null &&
                prod.urlImagen !== undefined &&
                prod.ulrImagen !== "" &&
                (image === null || image === undefined)
              ) {
                await RemoveImage(prod.urlImagen, prod.id);
              }
            }
            Swal.fire({
              icon: "success",
              title: "¡ÉXITO!",
              text: "El producto ha sido actualizado con éxito.",
              confirmButtonText: `Aceptar`,
            }).then(() => {
              navigate("/productos", {
                state: {
                  refetch: true,
                },
              });
            });
          });
      } catch (error) {
        console.error(error);
        if (error?.response?.data === "EMAIL_ALREADY_EXISTS") {
          Swal.fire(
            "",
            "El correo electrónico ingresado ya esta en uso.",
            "error"
          );
        } else {
          Swal.fire("", "Ha ocurrido un error inesperado.", "error");
        }
      }
    } else {
      try {
        const id = generateGuid();
        await axios
          .post(apiURL.concat("Productos"), {
            id: id,
            activo: true,
            nombre: values.nombre,
            clave: values.clave,
            marca: values.marca,
            descripcion: values.descripcion,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
            urlImagen: null,
            proveedorId: values.proveedorId,
          })
          .then(async (res) => {
            if (image !== null && image !== undefined) {
              try {
                await UploadImage(image, id);
              } catch (error) {
                console.error(error);
                Swal.fire(
                  "Advertencia",
                  "Ha ocurrido un error al subir la foto de perfil.",
                  "error"
                );
              }
            }
            Swal.fire({
              icon: "success",
              title: "¡ÉXITO!",
              text: "El producto ha sido agregado con éxito.",
              confirmButtonText: `Aceptar`,
            }).then(() => {
              navigate("/productos", {
                state: {
                  refetch: true,
                },
              });
            });
          });
      } catch (error) {
        console.error(error);
        if (error?.response?.data === "EMAIL_ALREADY_EXISTS") {
          Swal.fire(
            "",
            "El correo electrónico ingresado ya esta en uso.",
            "error"
          );
        } else if (error?.response?.data === "USERNAME_ALREADY_EXISTS") {
          Swal.fire(
            "",
            "El nombre de producto ingresado ya esta en uso.",
            "error"
          );
        } else {
          Swal.fire("", "Ha ocurrido un error inesperado.", "error");
        }
      }
    }
    setLoadingInternal(false);
  };

  const UploadImage = async (file, id) => {
    const storageRef = ref(storage, "images/" + generateGuid());
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    //AGREGAR LA URL AL USUARIO
    const res = await axios.get(apiURL.concat("Productos/" + id));
    let producto = res?.data;
    producto.urlImagen = url;
    await axios.put(apiURL.concat("Productos/" + id), producto);
  };

  const RemoveImage = async (url, id) => {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);

    //REMOVER LA URL AL USUARIO
    const res = await axios.get(apiURL.concat("Productos/" + id));
    let producto = res?.data;
    producto.urlImagen = "";
    await axios.put(apiURL.concat("Productos/" + id), producto);
  };

  useEffect(() => {
    if (location.state) {
      if (location.state.modelo) {
        const prod = location.state.modelo;
        setIsDetalle(location.state.isDetalle);
        setProducto(prod);
        datosProducto.setFieldsValue({
          nombre: prod.nombre,
          clave: prod.clave,
          marca: prod.marca,
          descripcion: prod.descripcion,
          proveedorId: prod.proveedorId,
        });
        if (prod.urlImagen !== null && prod.urlImagen !== "") {
          setImage(prod.urlImagen);
          document
            .getElementById("img_prod")
            .setAttribute("src", prod.urlImagen);
          document.getElementById("img_prod").style.display = "initial";
          const containerElement = document.getElementById("thumbnail");
          containerElement.style.display = "initial";

          const labelElement = document.getElementById("img_label");
          labelElement.style.display = "none";
        }
      }
    }
  }, [location.state]);

  const SeleccionarImagen = () => {
    document.getElementById("file_img").click();
  };

  const SubirImagen = (e) => {
    const [file] = e.target.files;
    if (!validarArchivo(file)) {
      Swal.fire({
        title: "",
        icon: "warning",
        text: "Formato de archivo no válido",
      });
    } else {
      setImage(e.target.files[0]);
      const imgElement = document.getElementById("img_prod");
      imgElement.setAttribute("src", URL.createObjectURL(file));
      imgElement.style.display = "initial";

      const containerElement = document.getElementById("thumbnail");
      containerElement.style.display = "initial";

      const labelElement = document.getElementById("img_label");
      labelElement.style.display = "none";
    }
  };

  const validarArchivo = (file) => {
    const fileExtension = file.name.split(".").pop().toLowerCase();

    return !!formatosValidosFotoPerfil.find((x) => x === fileExtension);
  };

  const RemoverImagen = () => {
    const file = document.getElementById("file_img");
    file.value = "";

    setImage(null);
    const imgElement = document.getElementById("img_prod");
    imgElement.setAttribute("src", "");
    imgElement.style.display = "none";

    const containerElement = document.getElementById("thumbnail");
    containerElement.style.display = "none";

    const labelElement = document.getElementById("img_label");
    labelElement.style.display = "initial";
  };

  return (
    <>
      <Spin spinning={loadingInternal}>
        <div
          style={{
            textTransform: "uppercase",
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          {producto === null ? "Agregar" : isDetalle ? "Detalle" : "Editar"}{" "}
          Producto
        </div>
        <div>
          <span>Administración</span>/
          <span
            className="rutaAnteriorGeneral"
            onClick={() => navigate("/usuarios")}
          >
            Productos
          </span>
          /
          <span>
            {producto === null ? "Agregar" : isDetalle ? "Detalle" : "Editar"}{" "}
            Producto
          </span>
        </div>
        &nbsp;
        <Form
          layout="vertical"
          style={{ marginTop: "2vw" }}
          form={datosProducto}
          onFinish={onFinish}
          autoComplete="off"
          className="formGeneral"
        >
          <Row gutter={16}>
            <Col span={5}>
              <div
                style={{
                  border: "1px",
                  borderColor: "black",
                  borderStyle: "solid",
                  borderRadius: "50%",
                  width: "15vw",
                  height: "15vw",
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  overflow: "hidden",
                }}
                onClick={!isDetalle ? SeleccionarImagen : null}
              >
                <p
                  id="img_label"
                  style={{
                    width: "100%",
                    alignSelf: "center",
                    textAlign: "center",
                  }}
                >
                  {ImgLabel}
                </p>
                <div
                  id="thumbnail"
                  style={{
                    position: "relative",
                    height: "15vw",
                    width: "15vw",
                    display: "none",
                    overflow: "hidden",
                  }}
                >
                  <img
                    id="img_prod"
                    alt="Image"
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      height: "100%",
                      width: "auto",
                      WebkitTransform: "translate(-50%, -50%)",
                      msTransform: "translate(-50%, -50%)",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
                <label>
                  <input
                    id="file_img"
                    type={"file"}
                    style={{ display: "none" }}
                    disabled={isDetalle}
                    onChange={(e) => SubirImagen(e)}
                  />
                </label>
              </div>
              &nbsp;
              <div hidden={image === null || image === undefined || isDetalle}>
                <Button danger onClick={RemoverImagen}>
                  Remover Imagen
                </Button>
              </div>
            </Col>
            <Col span={19}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label={"Nombre(s)"}
                    name="nombre"
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresar nombre.",
                      },
                    ]}
                    normalize={(input) => input.toUpperCase()}
                  >
                    <Input disabled={isDetalle} placeholder="Nombre(s)" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={"Clave"}
                    name="clave"
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresar clave.",
                      },
                    ]}
                    normalize={(input) => input.toUpperCase()}
                  >
                    <Input disabled={isDetalle} placeholder="Clave" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={"Marca"}
                    name="marca"
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresar marca del producto.",
                      },
                    ]}
                  >
                    <Input
                      disabled={isDetalle}
                      placeholder="Marca"
                      autoComplete="off"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <ProveedorFormSelect name={"proveedorId"} disabled={isDetalle} />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={"Descripción"}
                    name="descripcion"
                    rules={[
                      {
                        required: true,
                        message:
                          "Por favor, ingresar descripción del producto.",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      disabled={isDetalle}
                      placeholder="Descripción"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ justifyContent: "right" }}>
            <Button
              onClick={() => navigate("/productos")}
              className="btnPrimario"
            >
              {isDetalle ? "Regresar" : "Cancelar"}
            </Button>
            &nbsp;
            <Button
              type="primary"
              className="btnPrimario"
              htmlType="submit"
              disabled={isDetalle}
            >
              Guardar
            </Button>
          </Row>
        </Form>
      </Spin>
    </>
  );
};

export default FormUsuarios;
