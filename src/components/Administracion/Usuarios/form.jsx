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

const FormUsuarios = () => {
  const navigate = useNavigate();
  const [datosUsuario] = Form.useForm();
  const [loadingInternal, setLoadingInternal] = useState(false);
  const apiURL = config.API_URL;
  const [image, setImage] = useState(null);
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);
  const [isDetalle, setIsDetalle] = useState(false);
  const ImgLabel = "Seleccionar Imagen";

  const onFinish = async (values) => {
    setLoadingInternal(true);
    const user = location?.state?.modelo;
    if (user != null) {
      try {
        await axios
          .put(apiURL.concat("Usuarios/" + user.id), {
            id: user.id,
            activo: true,
            nombreUsuario: values.nombreUsuario,
            apellido: values.apellido,
            nombre: values.nombre,
            email: values.correo,
            contrasenia: values.contrasenia,
            rol: values.rol,
            fechaCreacion: user.fechaCreacion,
            fechaActualizacion: new Date(),
            urlImagen: null,
            numeroTelefono: values.numTelefono,
          })
          .then(async (res) => {
            if (
              image !== null &&
              image !== undefined &&
              image !== user.urlImagen
            ) {
              try {
                await UploadImage(image, user.id);
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
                user.urlImagen !== null &&
                user.urlImagen !== undefined &&
                user.ulrImagen !== "" &&
                (image === null || image === undefined)
              ) {
                await RemoveImage(user.urlImagen, user.id);
              }
            }
            Swal.fire({
              icon: "success",
              title: "¡ÉXITO!",
              text: "El usuario ha sido actualizado con éxito.",
              confirmButtonText: `Aceptar`,
            }).then(() => {
              navigate("/usuarios", {
                state: {
                  refetch: true,
                },
              });
            });
          });
      } catch (error) {
        console.error(error);
        Swal.fire("", "Ha ocurrido un error inesperado.", "error");
      }
    } else {
      try {
        const id = generateGuid();
        await axios
          .post(apiURL.concat("Usuarios"), {
            id: id,
            activo: true,
            nombreUsuario: values.nombreUsuario,
            apellido: values.apellido,
            nombre: values.nombre,
            email: values.correo,
            contrasenia: values.contrasenia,
            rol: values.rol,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
            urlImagen: null,
            numeroTelefono: values.numTelefono,
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
              text: "El usuario ha sido agregado con éxito.",
              confirmButtonText: `Aceptar`,
            }).then(() => {
              navigate("/usuarios", {
                state: {
                  refetch: true,
                },
              });
            });
          });
      } catch (error) {
        console.error(error);
        Swal.fire("", "Ha ocurrido un error inesperado.", "error");
      }
    }
    setLoadingInternal(false);
  };

  const UploadImage = async (file, id) => {
    const storageRef = ref(storage, "images/" + generateGuid());
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    //AGREGAR LA URL AL USUARIO
    const res = await axios.get(apiURL.concat("Usuarios/" + id));
    let usuario = res?.data;
    usuario.urlImagen = url;
    await axios.put(apiURL.concat("Usuarios/" + id), usuario);
  };

  const RemoveImage = async (url, id) => {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);

    //REMOVER LA URL AL USUARIO
    const res = await axios.get(apiURL.concat("Usuarios/" + id));
    let usuario = res?.data;
    usuario.urlImagen = "";
    await axios.put(apiURL.concat("Usuarios/" + id), usuario);
  };

  useEffect(() => {
    if (location.state) {
      if (location.state.modelo) {
        const user = location.state.modelo;
        setIsDetalle(location.state.isDetalle);
        setUsuario(user);
        datosUsuario.setFieldsValue({
          nombre: user.nombre,
          apellido: user.apellido,
          nombreUsuario: user.nombreUsuario,
          numTelefono: user.numeroTelefono,
          correo: user.email,
          contrasenia: user.contrasenia,
          rol: user.rol,
        });
        if (user.urlImagen !== null && user.urlImagen !== "") {
          setImage(user.urlImagen);
          document
            .getElementById("img_user")
            .setAttribute("src", user.urlImagen);
          document.getElementById("img_user").style.display = "initial";
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
      const imgElement = document.getElementById("img_user");
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
    const imgElement = document.getElementById("img_user");
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
          {usuario === null ? "Agregar" : isDetalle ? "Detalle" : "Editar"}{" "}
          Usuario
        </div>
        <div>
          <span>Administración</span>/
          <span
            className="rutaAnteriorGeneral"
            onClick={() => navigate("/usuarios")}
          >
            Usuarios
          </span>
          /
          <span>
            {usuario === null ? "Agregar" : isDetalle ? "Detalle" : "Editar"}{" "}
            Usuario
          </span>
        </div>
        &nbsp;
        <Form
          layout="vertical"
          style={{ marginTop: "2vw" }}
          form={datosUsuario}
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
                    id="img_user"
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
                    label={"Apellido(s)"}
                    name="apellido"
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresar apellido.",
                      },
                    ]}
                    normalize={(input) => input.toUpperCase()}
                  >
                    <Input disabled={isDetalle} placeholder="Apellido(s)" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={"Nombre de Usuario"}
                    name="nombreUsuario"
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresar nombre de usuario.",
                      },
                    ]}
                  >
                    <Input
                      disabled={isDetalle}
                      placeholder="Nombre de Usuario"
                      autoComplete="off"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={"Número de Teléfono"}
                    name="numTelefono"
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresar número de teléfono.",
                      },
                    ]}
                  >
                    <Input
                      disabled={isDetalle}
                      placeholder="Número de Teléfono"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label={"Correo"}
                    name="correo"
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresar correo.",
                      },
                      {
                        type: "email",
                        message: "El correo no es válido.",
                      },
                    ]}
                  >
                    <Input disabled={isDetalle} placeholder="correo" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={"Contraseña"}
                    name="contrasenia"
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresar contraseña.",
                      },
                    ]}
                  >
                    <Input.Password disabled={isDetalle} placeholder="correo" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Rol"
                    name={"rol"}
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresar rol.",
                      },
                    ]}
                  >
                    <Select
                      placeholder={"Rol"}
                      allowClear
                      notFoundContent={"Sin opciónes"}
                      style={{
                        fontFamily: "TodaySHOP-Regular",
                        fontSize: "1.2vw",
                        width: "100%",
                      }}
                      disabled={isDetalle}
                    >
                      {ListaRoles.map((item, key) => (
                        <Select.Option value={item.value} key={key}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ justifyContent: "right" }}>
            <Button
              onClick={() => navigate("/usuarios")}
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
