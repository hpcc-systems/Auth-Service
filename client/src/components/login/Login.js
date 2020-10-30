import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import  {authActions}  from '../../redux/actions/Auth';

function Login() {
  let history = useHistory();  
  const [form] = Form.useForm();  
  const dispatch = useDispatch();
  
  const onFinish = (values) => {
    dispatch(authActions.login(values.username, values.password))
    .then(() => {
      history.push("/applications");    
      //window.location.reload(); 
    })
    .catch((error) => {
      console.log(error);
      if(error == 'Insufficitent Privileges') {
        message.error("Login failed - Insufficitent Privileges")
      } else {
        message.error("Login failed");
      }
    });
  }

  return (
    <React.Fragment>
      <Form
      name="normal_login"
      className="login-form"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      form={form}
    >
      <h2 className={"text-center"}>Auth Service</h2> 
      <Form.Item
        name="username"
        rules={[{ required: true, message: 'Please enter your Username!' }]}
      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please enter your Password!' }]}
      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>      

      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Log in
        </Button>
      </Form.Item>
    </Form>
    </React.Fragment>
    )  
}

export default Login
