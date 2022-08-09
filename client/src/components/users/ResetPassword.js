import React, { useState } from 'react'
import { Form, Input, Modal, message } from 'antd';
import { authHeader, handleErrors } from "../common/AuthHeader.js"

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

function ChangePasswordDialog({ isShowing, onClose, username }) {
	const [setChangePasswordDetails] = useState({
    newpassword: ''
  });	
	const [form] = Form.useForm();	  

  const handleOk = (values) => {    
    values.username = username;
    console.log(JSON.stringify(values));
    fetch('/api/users/resetpwd', {
      method: 'post',
      headers: authHeader(),
      body: JSON.stringify(values)
    })
    .then(handleErrors)
    .then(function(response) {
      message.success("Password changed successfully")
      onClose();
      resetForm();
    }).catch(function(error) {
      console.log(error);
      message.error("There was an error changing the password: "+error);      
    });
  }    

  const resetForm = () => {
    form.resetFields(); 
    resetState();
  }

  const resetState = () => {
    setChangePasswordDetails({
      username: '',
      newpassword: ''
    });    
  }

  
  return (
  	<React.Fragment>
	  	<Modal
          title="Reset Password"
          visible={isShowing}
          forceRender // Before Modal opens, children elements do not exist in the view.forceRender pre-renders its children. if not done browser console error -  'Instance created by `useForm` is not connected to any Form element'
          onCancel={onClose}
          width={800}
          onOk={() => {
            form
              .validateFields()
              .then(values => {
                form.resetFields();
                handleOk(values);
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
              label="New Password"
              name="newpassword"
              rules={[{ min: 4, message: 'Password has to be atleast 4 characters long!'}, { required: true, message: 'Please enter password!' }]}
            >
                <Input type="password"/>
            </Form.Item>                        
        </Form>
        </Modal>
	  </React.Fragment>  
  );
}

export default ChangePasswordDialog