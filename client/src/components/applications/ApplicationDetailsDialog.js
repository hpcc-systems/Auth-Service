import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Modal, message } from 'antd';
import { Constants } from '../common/Constants';
import { authHeader, handleErrors } from "../common/AuthHeader.js"
const Option = Select.Option;
const { TextArea } = Input;


const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

function ApplicationDetailsDialog({ isShowing, onClose, selectedApplicationId, applications }) {
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
    if(selectedApplicationId !== '') {
      fetchApplicationDetails();    
    }
     // eslint-disable-next-line
  }, [selectedApplicationId])

  const handleOk = () => {
    if(applications.filter(application => application.clientId === applicationDetails.clientId).length > 0) {
      message.error("There is already an Application with the same Client Id, please use a different Client Id for "+applicationDetails.name);
      return;
    }

    fetch('/api/application', {
      method: applicationDetails.id === '' ? 'post' : 'put',
      headers: authHeader(),
      body: JSON.stringify(applicationDetails)
    })
    .then(handleErrors)
    .then(function(response) {
      message.success("Application has been saved successfully")
      onClose();
      resetForm();
    }).catch(function(error) {
      console.log(error);
      message.error("There was an error saving the Application: "+error);      
    });
  }  

  const fetchApplicationDetails = () => {
    fetch('/api/application?id='+selectedApplicationId, {
      method: 'get',
      headers: authHeader(),
    })
    .then(handleErrors)
    .then(function(applicationData) {
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
    setApplicationDetails({...applicationDetails, 'applicationType': value})
  }


  return (
  	<React.Fragment>
	  	<Modal
          title="Application Details"
          visible={isShowing}
          onCancel={onClose}
          forceRender // Before Modal opens, children elements do not exist in the view.forceRender pre-renders its children. if not done browser console error -  'Instance created by `useForm` is not connected to any Form element'
          width={800}
          onOk={() => {
            form
              .validateFields()
              .then(values => {                
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
              rules={[{ required: true, pattern: new RegExp(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/), message: 'Please enter a valid name!.' }]}
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
              rules={[{ required: true, pattern: new RegExp(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/), message: 'Please enter a valid client id!' }]}
            >
              <Input id="clientId" name="clientId" onChange={onChange} placeholder="Client Id" value={applicationDetails.clientId}/>
            </Form.Item>
            <Form.Item
              label="Owner"
              name="owner"
              required
              rules={[{ required: true, pattern: new RegExp(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/), message: 'Please enter a valid owner!' }]}
            >
              <Input id="owner" name="owner" onChange={onChange} placeholder="Owner" value={applicationDetails.owner}/>
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              required
              rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              {
                required: true,
                message: 'Please input E-mail!'
              },
            ]}
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