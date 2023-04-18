import { Form, Select, Spin } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { config } from "../../../config";

const ProveedorFormSelect = ({ disabled, name }) => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = config.API_URL.concat("Proveedores");

  const ObtenerProveedores = async () => {
    setLoading(true);
    await axios
      .get(apiUrl)
      .then((res) => {
        setProveedores(
          res.data.map((x) => ({
            label: x.razonSocial,
            value: x.id,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    ObtenerProveedores();
  }, []);

  return (
    <>
      <Spin spinning={loading}>
        <Form.Item
          name={name}
          label={"Proveedor"}
          rules={[
            {
              required: true,
              message: "Campo requerido.",
            },
          ]}
        >
          <Select
            disabled={disabled}
            placeholder={"Seleccione un proveedor"}
            notFoundContent={"Sin opciones"}
          >
            {proveedores?.map((x, i) => (
              <Select.Option key={i} value={x.value}>
                {x.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Spin>
    </>
  );
};

export { ProveedorFormSelect };
