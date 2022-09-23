import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, message, Checkbox } from 'antd';

import { Constants } from '../common/Constants';
import { authHeader } from '../common/AuthHeader.js';

const Option = Select.Option;
const { TextArea } = Input;

function ApplicationDetailsDialog({ isShowing, onClose, selectedApplication, applications, notificationSettingsConfigured }) {
  const [form] = Form.useForm();
  const [selectedApplicationType, setSelectedApplicationType] = useState("");

  //Use effect
  useEffect(() => {
    if (selectedApplication) {
      form.setFieldsValue(selectedApplication);
      setSelectedApplicationType(selectedApplication.applicationType);
    }
    // eslint-disable-next-line
  }, [selectedApplication]);

  //Close Modal -. When cancel or X clicked or when form submitted success
  const closeModal = () => {
    form.resetFields();
    onClose();
  };

  //Save job Function
  const saveApplication = async () => {
    await form.validateFields();

    if (applications.map((application) => application.name).includes(form.getFieldValue("name")) && !selectedApplication) {
      message.error("Please pick a unique application name");
      return;
    }

    // Payload
    const applicationDetails = form.getFieldsValue();
    if (selectedApplication) applicationDetails.id = selectedApplication.id;

    try {
      const response = await fetch("/api/application", {
        method: selectedApplication ? "put" : "post", // put if editing
        headers: authHeader(),
        body: JSON.stringify(applicationDetails),
      });

      if (!response.ok) throw new Error("Unable to save application");
      message.success("Application saved");
      closeModal();
    } catch (err) {
      message.error(err.message);
    }
  };

  //JSX
  return (
    <Modal visible={isShowing} onCancel={closeModal} onOk={saveApplication} width={700} maskClosable={false}>
      <Form layout="vertical" name="basic" form={form}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, pattern: new RegExp(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/), message: "Please enter a valid name!." }]}
          style={{ marginBottom: "5px" }}
        >
          <Input name="name" placeholder="Name" />
        </Form.Item>

        <Form.Item
          label="Application Type"
          name="applicationType"
          rules={[{ required: true, message: "Please enter application type!" }]}
          style={{ marginBottom: "5px" }}
        >
          <Select placeholder="Application Type" onChange={(value) => setSelectedApplicationType(value)}>
            {Constants.APPLICATION_TYPES.map((applicationType) => (
              <Option key={applicationType}>{applicationType}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item style={{ marginBottom: "-10px" }}>
          <Form.Item
            label="Client Id"
            name="clientId"
            rules={[{ required: true, pattern: new RegExp(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/), message: "Please enter a valid client id!" }]}
            style={{ display: "inline-block", width: "calc(60% - 8px)" }}
          >
            <Input name="clientId" placeholder="Client ID" />
          </Form.Item>

          <Form.Item
            label="Token TTL (Min : 300, Max :1440 )"
            name="tokenTtl"
            rules={[
              {
                type: "number",
                min: 300,
                max: 3600,
                message: "Token TTL must be between 300 and 3600",
              },
            ]}
            style={{ display: "inline-block", width: "calc(40% - 8px)", marginLeft: "16px" }}
          >
            <InputNumber name="tokenTtl" style={{ width: "100%" }} placeholder="Token TTL in minutes" />
          </Form.Item>
        </Form.Item>

        {selectedApplicationType === "HPCC" || !selectedApplicationType || !notificationSettingsConfigured ? null : (
          <Form.Item
            name="registrationConfirmationRequired"
            wrapperCol={{
              offset: 0,
              span: 16,
            }}
            valuePropName="checked"
            style={{ marginBottom: "5px" }}
          >
            <Checkbox>Send registration confirmation</Checkbox>
          </Form.Item>
        )}

        <Form.Item
          label="Owner"
          name="owner"
          rules={[{ required: true, pattern: new RegExp(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/), message: "Please enter a valid owner!" }]}
          style={{ marginBottom: "5px" }}
        >
          <Input name="owner" placeholder="Owner" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          required
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail!",
            },
            {
              required: true,
              message: "Please input E-mail!",
            },
          ]}
          style={{ marginBottom: "5px" }}
        >
          <Input name="email" placeholder="E-mail" />
        </Form.Item>

        <Form.Item label="Description" name="description" style={{ marginBottom: "5px" }}>
          <TextArea rows={2} autoSize={{ minRows: 2 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ApplicationDetailsDialog;
