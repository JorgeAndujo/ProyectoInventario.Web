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

const FormProveedores = () => {
  const navigate = useNavigate();
  const [datosProveedor] = Form.useForm();
  const [loadingInternal, setLoadingInternal] = useState(false);
  const apiURL = config.API_URL;
  const location = useLocation();
  const [proveedor, setProveedor] = useState(null);
  const [isDetalle, setIsDetalle] = useState(false);

  const onFinish = async (values) => {
    setLoadingInternal(true);
    const prov = location?.state?.modelo;
    if (prov != null) {
      try {
        await axios
          .put(apiURL.concat("Proveedores/" + prov.id), {
            id: prov.id,
            activo: true,
            razonSocial: values.razonSocial,
            correo: values.correo,
            fechaCreacion: prov.fechaCreacion,
            fechaActualizacion: new Date(),
            numeroTelefono: values.numeroTelefono,
            rfc: values.rfc,
            nombreComercial: values.nombreComercial
          })
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "¡ÉXITO!",
              text: "El proveedor ha sido actualizado con éxito.",
              confirmButtonText: `Aceptar`,
            }).then(() => {
              navigate("/proveedores", {
                state: {
                  refetch: true,
                },
              });
            });
          });
      } catch (error) {
        console.error(error);
        if(error?.response?.data === "RFC_ALREADY_EXISTS")
        {
          Swal.fire("", "El RFC ingresado ya esta en uso.", "error");
          
        } else if(error?.response?.data === "RAZONSOCIAL_ALREADY_EXISTS"){
          Swal.fire("", "La Razon Social ingresada ya esta en uso.", "error");
        } else{
          Swal.fire("", "Ha ocurrido un error inesperado.", "error");
        }
      }
    } else {
      try {
        const id = generateGuid();
        await axios
          .post(apiURL.concat("Proveedores"), {
            id: id,
            activo: true,
            razonSocial: values.razonSocial,
            correo: values.correo,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
            numeroTelefono: values.numeroTelefono,
            rfc: values.rfc,
            nombreComercial: values.nombreComercial
          })
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "¡ÉXITO!",
              text: "El proveedor ha sido agregado con éxito.",
              confirmButtonText: `Aceptar`,
            }).then(() => {
              navigate("/proveedores", {
                state: {
                  refetch: true,
                },
              });
            });
          });
      } catch (error) {
        console.error(error);
        if(error?.response?.data === "RFC_ALREADY_EXISTS")
        {
          Swal.fire("", "El RFC ingresado ya esta en uso.", "error");
          
        } else if(error?.response?.data === "RAZONSOCIAL_ALREADY_EXISTS"){
          Swal.fire("", "La Razon Social ingresada ya esta en uso.", "error");
        } else{
          Swal.fire("", "Ha ocurrido un error inesperado.", "error");
        }
      }
    }
    setLoadingInternal(false);
  };

  useEffect(() => {
    if (location.state) {
      if (location.state.modelo) {
        const prov = location.state.modelo;
        setIsDetalle(location.state.isDetalle);
        setProveedor(prov);
        datosProveedor.setFieldsValue({
            razonSocial: prov.razonSocial,
            correo: prov.correo,
            numeroTelefono: prov.numeroTelefono,
            rfc: prov.rfc,
            nombreComercial: prov.nombreComercial
        });
      }
    }
  }, [location.state]);

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
          {proveedor === null ? "Agregar" : isDetalle ? "Detalle" : "Editar"}{" "}
          Proveedor
        </div>
        <div>
          <span>Administración</span>/
          <span
            className="rutaAnteriorGeneral"
            onClick={() => navigate("/proveedores")}
          >
            Proveedores
          </span>
          /
          <span>
            {proveedor === null ? "Agregar" : isDetalle ? "Detalle" : "Editar"}{" "}
            Usuario
          </span>
        </div>
        &nbsp;
        <Form
          layout="vertical"
          style={{ marginTop: "2vw" }}
          form={datosProveedor}
          onFinish={onFinish}
          autoComplete="off"
          className="formGeneral"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label={"Razon Social"}
                    name="razonSocial"
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresar razon social.",
                      },
                    ]}
                    normalize={(input) => input.toUpperCase()}
                  >
                    <Input disabled={isDetalle} placeholder="Razon Social" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={"RFC"}
                    name="rfc"
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresar RFC.",
                      },
                    ]}
                    normalize={(input) => input.toUpperCase()}
                  >
                    <Input disabled={isDetalle} placeholder="RFC" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={"Nombre Comercial"}
                    name="nombreComercial"
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresar nombre comercial.",
                      },
                    ]}
                  >
                    <Input disabled={isDetalle} placeholder="Nombre Comercial" />
                  </Form.Item>
                </Col>
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
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label={"Número de Teléfono"}
                    name="numeroTelefono"
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
            </Col>
          </Row>
          <Row style={{ justifyContent: "right" }}>
            <Button
              onClick={() => navigate("/proveedores")}
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

export default FormProveedores;
