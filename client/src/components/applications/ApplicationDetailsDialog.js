import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Select, Tooltip, Modal, message } from 'antd';
import { SearchOutlined, PlusOutlined, MinusCircleOutlined  } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import { Constants } from '../common/Constants';
import { authHeader } from "../common/AuthHeader.js"
const Option = Select.Option;
const { TextArea } = Input;


const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

function ApplicationDetailsDialog({ isShowing, onClose, selectedApplicationId }) {
	const [applicationDetails, setApplicationDetails] = useState({
    id: '',
    name: '',
    applicationType: '',
    clientId: '',
    owner: '',
    email: '',
    description: ''
  });	
	const [form] = Form.useForm();	

  useEffect(() => {       
    resetForm();
    if(selectedApplicationId != '') {
      fetchApplicationDetails();    
    }
  }, [selectedApplicationId])

  const handleOk = () => {
    fetch('/api/application', {
      method: applicationDetails.id == '' ? 'post' : 'put',
      headers: authHeader(),
      body: JSON.stringify(applicationDetails)
    }).then(function(response) {
      if(response.ok) {
        return response.json();
      } else {
        message.error("There was an error saving the Application")
      }
    }).then(function(data) {
      message.success("Application has been saved successfully")
      onClose();
      resetForm();
    });
  }  

  const fetchApplicationDetails = () => {
    fetch('/api/application?id='+selectedApplicationId, {
      method: 'get',
      headers: authHeader(),
    }).then(function(response) {
      if(response.ok) {
        return response.json();
      } else {
        message.error("There was an error retrieving the details of the application")
      }
    }).then(function(applicationData) {
      setApplicationDetails({
        id: applicationData.id,
        name: applicationData.applicationType,
        applicationType: applicationData.applicationType,
        clientId: applicationData.clientId,
        owner: applicationData.owner,
        email: applicationData.email,
        description: applicationData.description
      });
      form.setFieldsValue({
        id: applicationData.id,
        name: applicationData.applicationType,
        applicationType: applicationData.applicationType,
        clientId: applicationData.clientId,
        owner: applicationData.owner,
        email: applicationData.email,
        description: applicationData.description
      });
    });

  }  

  const resetForm = () => {
    form.resetFields(); 
    resetState();
  }

  const resetState = () => {
    setApplicationDetails({
      id: '',
      name: '',
      applicationType: '',
      clientId: '',
      owner: '',
      email: '',
      description: ''
    });    
  }

  const onChange = (e) => {
    setApplicationDetails({...applicationDetails, [e.target.name]: e.target.value})
  }

  const onApplicationTypeChange = (value) => {
    setApplicationDetails({...applicationDetails, ['applicationType']: value})
  }


  return (
  	<React.Fragment>
	  	<Modal
          title="Application Details"
          visible={isShowing}
          onCancel={onClose}
          width={800}
          onOk={() => {
            form
              .validateFields()
              .then(values => {
                form.resetFields();
                handleOk();
              })
              .catch(info => {
                console.log('Validate Failed:', info);
              });
          }}
        >
          <Form
            {...layout}
            name="basic"       
            form={form}     
            initialValues={{ remember: true }}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please enter application name!' }]}
            >
              <Input id="name" name="name" placeholder="Name" onChange={onChange}  value={applicationDetails.name}/>
            </Form.Item>
            
            <Form.Item
              label="Application Type"
              name="applicationType"
              required
              rules={[{ required: true, message: 'Please enter application type!' }]}
            >
              <Select id="applicationType" placeholder="Application Type" style={{ width: 190 }} onChange={onApplicationTypeChange} value={applicationDetails.applicationType}>
                {Constants.APPLICATION_TYPES.map(applicationType => <Option key={applicationType}>{applicationType}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item
              label="Client Id"
              name="clientId"
              required
              rules={[{ required: true, message: 'Please enter a client id!' }]}
            >
              <Input id="clientId" name="clientId" onChange={onChange} placeholder="Client Id" value={applicationDetails.clientId}/>
            </Form.Item>
            <Form.Item
              label="Owner"
              name="owner"
              required
              rules={[{ required: true, message: 'Please enter owner!' }]}
            >
              <Input id="owner" name="owner" onChange={onChange} placeholder="Owner" value={applicationDetails.owner}/>
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              required
              rules={[{ required: true, message: 'Please enter valid email address!' }]}
            >
              <Input id="email" name="email" onChange={onChange} placeholder="Email" value={applicationDetails.email}/>
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
            >
              <TextArea rows={4} style={{"width": "400px"}} id="description" name="description" onChange={onChange} value={applicationDetails.description}/>
            </Form.Item>
        </Form>
        </Modal>
	  </React.Fragment>  
  );
}

export default ApplicationDetailsDialog