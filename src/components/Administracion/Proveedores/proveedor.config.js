import { Image } from "antd";
import { Roles } from "../../pipes/enums";
import {
  EditOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

export const headers = [
  {
    title: "Razon Social",
    key: "razonSocial",
    dataIndex: "name",
    render: (_, row) => (
      <>
        <div><strong>{row.razonSocial}</strong></div>
        <div>{row.rfc}</div>
      </>
    ),
  },
  {
    title: "Contacto",
    key: "correo",
    dataIndex: "correo",
    render: (_, row) => (
      <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span style={{ fontWeight: 700 }}>{row.correo.toUpperCase()}</span>
          <span>{row.numeroTelefono}</span>
        </div>
      </>
    ),
  },
];

export const actions = [
  {
    key: "detalle",
    tooltip: "Detalle",
    icon: <EyeOutlined />,
  },
  {
    key: "editar",
    tooltip: "Editar",
    icon: <EditOutlined />,
  },
  {
    key: "eliminar",
    tooltip: "Eliminar",
    icon: <CloseCircleOutlined />,
  },
];
