import { DeleteOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Popconfirm, Radio, Space, Typography, theme, Spin } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import { Organization } from "../types";
import "./Settings.css";

type GeneralSettingsForm = {
  name: string;
  description: string;
  executionMode: "remote" | "local";
};

export const GeneralSettings = () => {
  const { orgid } = useParams();
  const [organization, setOrganization] = useState<Organization>();
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [form] = Form.useForm();

  const onFinish = (values: GeneralSettingsForm) => {
    setWaiting(true);
    const body = {
      data: {
        type: "organization",
        id: orgid,
        attributes: {
          name: values.name,
          description: values.description,
          executionMode: values.executionMode,
        },
      },
    };

    axiosInstance
      .patch(`organization/${orgid}`, body, {
        headers: {
          "Content-Type": "application/vnd.api+json",
        },
      })
      .then((response) => {
        if (response.status == 204) {
          message.success("Organization updated successfully");
        } else {
          message.error("Organization update failed");
        }
        setWaiting(false);
      });
  };

  const onDelete = () => {
    const body = {
      data: {
        type: "organization",
        id: orgid,
        attributes: {
          disabled: "true",
        },
      },
    };

    axiosInstance
      .patch(`organization/${orgid}`, body, {
        headers: {
          "Content-Type": "application/vnd.api+json",
        },
      })
      .then((response) => {
        if (response.status == 204) {
          message.success("Organization deleted successfully, please logout and login to Terrakube");
        } else {
          message.error("Organization deletion failed");
        }
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Failed to update organization settings');
  };

  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`organization/${orgid}`).then((response) => {
      setOrganization(response.data.data);
      form.setFieldsValue({
        name: response.data.data.attributes.name,
        description: response.data.data.attributes.description,
        executionMode: response.data.data.attributes.executionMode,
      });
      setLoading(false);
    }).catch((error) => {
      console.log(error);
      message.error('Failed to load organization settings');
      setLoading(false);
    });
  }, [orgid, form]);

  return (
    <div className="setting">
      <h1>General Settings</h1>
      {loading || organization === undefined ? (
        <Spin tip="Loading Organization Settings..." />
      ) : (
        <Spin spinning={waiting}>
          <div>
            <Typography.Text type="secondary" className="App-text">
              Configure general settings for your organization.
            </Typography.Text>
          </div>
          <Form
            layout="vertical"
            name="form-settings"
            onFinish={onFinish}
            initialValues={{
              name: organization.attributes.name,
              description: organization.attributes.description,
              executionMode: organization.attributes.executionMode,
            }}
          >
            <Form.Item name="name" label="Name">
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="executionMode" label="Default Execution Mode">
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="remote">
                    <b>Remote</b>
                    <Typography.Text type="secondary" style={{ display: 'block' }}>
                      Terrakube hosts your plans and applies, allowing you and your team to collaborate and review jobs
                      in the app.
                    </Typography.Text>
                  </Radio>
                  <Radio value="local">
                    <b>Local</b>
                    <Typography.Text type="secondary" style={{ display: 'block' }}>
                      Your planning and applying jobs are performed on your own machines. Terrakube is used just for
                      storing and syncing the state.
                    </Typography.Text>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Update organization
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      )}
      <h1>Delete this Organization</h1>
      <div>
        <Typography.Text type="secondary" className="App-text">
          Deleting the organization will permanently delete all workspaces associated with it. Please be certain that you
          understand this.
        </Typography.Text>
      </div>
      <Popconfirm
        onConfirm={() => {
          onDelete();
        }}
        style={{ width: "100%" }}
        title={
          <p>
            Organization will be permanently deleted and all workspaces will be marked as deleted <br />
            <br />
            Are you sure?
          </p>
        }
        okText="Yes"
        cancelText="No"
        placement="bottom"
      >
        <Button type="default" danger style={{ width: "100%" }}>
          <Space>
            <DeleteOutlined />
            Delete from Terrakube
          </Space>
        </Button>
      </Popconfirm>
    </div>
  );
};
