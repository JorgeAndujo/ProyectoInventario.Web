import { Image } from "antd";
import { useNavigate } from "react-router-dom";
import useStore from "../../../zustand/useStore";
import Header from "./Header";
import { ProfileOutlined, ShoppingCartOutlined, ReconciliationOutlined } from "@ant-design/icons";
import { usuarioLogueado } from "../../../utils/loggedInfo";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { tipoMenu, setTipoMenu } = useStore();
  const userInfo = usuarioLogueado();

  return (
    <>
      <Header />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div className="sideBarMenu">
          <Image
            preview={false}
            onClick={() => {
              setTipoMenu("sinMenu");
              navigate("./Inicio");
            }}
            src={"./Logo.png"}
            style={{
              zIndex: 4000,
              width: "8vw",
              height: '8vw',
              marginBottom: "1vw",
            }}
          />
          <div
            hidden={userInfo?.rol !== "ADMINISTRADOR"}
            className="itemSubMenu"
            id={tipoMenu === "Administracion" && "itemSubMenu"}
            onClick={() => {
              setTipoMenu("Administracion");
              navigate("./usuarios");
            }}
          >
            <ProfileOutlined />
            &nbsp;Administración
          </div>
          <div
            className="itemSubMenu"
            id={tipoMenu === "Inventario" && "itemSubMenu"}
            onClick={() => {
              setTipoMenu("Inventario");
              navigate("./inventario");
            }}
          >
            <ReconciliationOutlined />
            &nbsp;Inventario
          </div>
          <div
            className="itemSubMenu"
            id={tipoMenu === "Ventas" && "itemSubMenu"}
            onClick={() => {
              setTipoMenu("Ventas");
              navigate("./ventas");
            }}
          >
            <ShoppingCartOutlined />
            &nbsp;Ventas
          </div>
        </div>
        <div
          style={{
            width: '100%',
            marginLeft: '14%',
            padding: '1vw 2vw',
            backgroundColor: '#F4F4F4',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '4.5vw',
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
