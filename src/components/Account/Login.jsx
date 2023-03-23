import { Button, Col, Form, Image, Input, Row, Spin } from "antd";
import FormItem from "antd/es/form/FormItem";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { config } from "../../config";
import { setLoggedInfo } from "../../utils/loggedInfo";

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const apiGetUsuarios = config.API_URL.concat("Usuarios");
  const [loadingInternal, setLoadingInternal] = useState(false);

  const onSubmit = async (value) => {
    setLoadingInternal(true);
    try {
      const response = await axios.get(apiGetUsuarios + "/validateLogin/" + value.usuario);
      if(response.data){
        const usuarioBd = response.data;
        if(usuarioBd.contrasenia !== value.contra){
          Swal.fire('Error', 'La contraseña ingresada es incorrecta.', 'error');
        } else{
          Swal.fire({
            icon: "success",
            title: "¡ÉXITO!",
            text: "Se ha iniciado sesión correctamente",
            confirmButtonText: `Aceptar`,
          }).then(() => {
            localStorage.setItem("session", "true");
            setLoggedInfo(usuarioBd);
            navigate("/inicio");
          });
        }
      }
      setLoadingInternal(false);
    } catch (error) {
      Swal.fire("Error", "El usuario ingresado no existe.", "error");
      setLoadingInternal(false);
    }
  };

  return (
    <>
      <Spin spinning={loadingInternal}>
        <div
          style={{
            textAlign: "center",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundSize: "cover",
            backgroundImage: 'url("../fondo.jpg")',
          }}
        >
          <div
            style={{
              width: "85%",
              borderRadius: "1vw",
              backgroundColor: "#FFFFFF",
              backgroundSize: "cover",
              height: "fit-content",
              boxShadow: "10px 10px 5px 0px rgba(0,0,0,0.15)",
            }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ backgroundColor: "#15458D", height: "35vw" }}>
                  <Image
                    src="./Logo.png"
                    width={"15vw"}
                    preview={false}
                    style={{ marginTop: "8vw" }}
                  />
                </div>
              </Col>
              <Col span={16}>
                <div style={{ width: "100%" }}>
                  <div style={{ display: "inline-flex", marginTop: "5vw" }}>
                    <Image src="./Logo.png" width={"7vw"} preview={false} />
                    <div style={{ fontSize: "larger" }}>
                      &nbsp;<p style={{ margin: "0" }}>SISTEMA DE INVENTARIO</p>{" "}
                      <p style={{ margin: "0" }}>PARA MINISUPER</p>
                    </div>
                  </div>
                </div>
                <Form
                  form={form}
                  layout={"vertical"}
                  onFinish={(e) => onSubmit(e)}
                >
                  <div style={{ marginTop: "3vw" }}>
                    <Row>
                      <Col span={6}></Col>
                      <Col span={12}>
                        {" "}
                        <FormItem label={"Usuario"} name={"usuario"}>
                          <Input placeholder="Escriba su nombre de usuario" />
                        </FormItem>
                      </Col>
                      <Col span={6}></Col>
                    </Row>
                    <Row>
                      <Col span={6}></Col>
                      <Col span={12}>
                        {" "}
                        <FormItem label={"Contraseña"} name={"contra"}>
                          <Input.Password placeholder="Escriba su contraseña" />
                        </FormItem>
                      </Col>
                      <Col span={6}></Col>
                    </Row>
                  </div>
                  <div>
                    <Button type="primary" htmlType="submit">
                      INICIAR SESION
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </div>
        </div>
      </Spin>
    </>
  );
};

export default Login;
