import { Image, Popover } from "antd";
import { BellFilled } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import useStore from "../../../zustand/useStore";
import { setLoggedInfo, usuarioLogueado } from "../../../utils/loggedInfo";
import { Roles } from "../../pipes/enums";

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { tipoMenu } = useStore();
  const userInfo = usuarioLogueado();

  return (
    <>
      <div className="headerMenu">
        <div style={{ display: "flex" }}>
          <Image
            preview={false}
            onClick={() => navigate("./inicio")}
            src="./Logo.svg"
            style={{
              zIndex: 4000,
              margin: "1vw 1.5vw",
              width: "10vw",
              position: "absolute",
            }}
          />
          <div className="subMenus">
            {tipoMenu === "sinMenu" && (
              <>
                <div className="textoSinMenu">
                  Seleccione un menú de la parte izquierda
                </div>
              </>
            )}
            {tipoMenu === "Administracion" && (
              <>
                <div
                  className="itemMenu"
                  id={pathname.includes("usuarios") && "currentItemMenu"}
                  onClick={() => navigate("./usuarios")}
                >
                  Usuarios
                </div>
                <div
                  className="itemMenu"
                  id={pathname.includes("proveedores") && "currentItemMenu"}
                  onClick={() => navigate("./proveedores")}
                >
                  Proveedores
                </div>
                <div
                  className="itemMenu"
                  id={pathname.includes("productos") && "currentItemMenu"}
                  onClick={() => navigate("./productos")}
                >
                  Productos
                </div>
              </>
            )}
            {tipoMenu === "Inventario" && (
              <>
                <div
                  className="itemMenu"
                  id={pathname.includes("inventario") && "currentItemMenu"}
                  onClick={() => navigate("./inventario")}
                >
                  Inventario
                </div>
                <div
                  className="itemMenu"
                  id={pathname.includes("movimientos") && "currentItemMenu"}
                  onClick={() => navigate("./movimientos")}
                >
                  Movimientos
                </div>
              </>
            )}
            {tipoMenu === "Ventas" && (
              <>
                <div
                  className="itemMenu"
                  id={pathname.includes("ventas") && "currentItemMenu"}
                  onClick={() => navigate("./ventas")}
                >
                  Ventas
                </div>
                <div
                  className="itemMenu"
                  id={pathname.includes("historialVentas") && "currentItemMenu"}
                  onClick={() => navigate("./historialVentas")}
                >
                  Historial de Ventas
                </div>
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div
            style={{
              padding: '1vw',
              backgroundColor: '#15458D',
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.5vw',
            }}
          >
            <BellFilled style={{ color: 'white'}} />
          </div>
          <Popover
            placement='bottomRight'
            trigger='click'
            content={
              <div style={{ minWidth: '20vw', height: '10vw' }}>
                <div
                  style={{
                    fontFamily: 'TodaySHOP-Regular',
                    fontSize: '1.4vw',
                    textTransform: 'uppercase',
                    color: '#15458D',
                  }}
                >
                  {userInfo.nombreUsuario}
                </div>
                <div
                  style={{
                    fontFamily: 'TodaySHOP-Regular',
                    fontSize: '1vw',
                    fontStyle: 'italic',
                    marginTop: '-0.5vw',
                  }}
                >
                  {Roles[userInfo.rol]}
                </div>
                <hr></hr>
                <div
                  style={{
                    cursor: 'pointer',
                    marginTop: '2.5vw',
                    fontFamily: 'TodaySHOP-Regular',
                    fontSize: '1.1vw',
                  }}
                >
                  Cambiar Contraseña
                </div>
                <div
                  style={{
                    cursor: 'pointer',
                    fontFamily: 'TodaySHOP-Regular',
                    fontSize: '1.1vw',
                  }}
                  onClick={() => {
                    localStorage.setItem("session", "false");
                    setLoggedInfo(null);
                    navigate("/login")
                  }}
                >
                  Cerrar Sesión
                </div>
              </div>
            }
          >
            <div className='userMenu'>
              <Image
                preview={false}
                src={userInfo.urlImagen}
                style={{
                  width: '3.5vw',
                  marginRight: '1vw',
                }}
              />
              {userInfo.nombreUsuario}
            </div>
          </Popover>
        </div>
      </div>
    </>
  );
};

export default Header;
