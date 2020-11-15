import React, { useState, useEffect } from 'react'
import { Table, Tabs, Form, Input, Button, Select, Typography, Radio, Tooltip, Row, Col, message } from 'antd';
import { SearchOutlined, PlusOutlined, MinusCircleOutlined  } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import { Constants } from '../common/Constants';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { authHeader, handleErrors } from "../common/AuthHeader.js"

const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const Option = Select.Option;
const layout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 16 },
  layout: "Vertical"
};
const formitemlayoutwithoutlabel = {
  wrapperCol: {
    xs: { span: 20, offset: 0 },
    sm: { span: 16, offset: 3 },
  },
};


function RoleDetails() {		
	const [form] = Form.useForm();	
	const [data, setData] = useState([]);
	const [roleDetails, setRoleDetails] = useState({});
	const roleReducer = useSelector(state => state.roleReducer);			
	const role = roleReducer.role;
	const appType = role ? role.applicationType : '';
	const roleId = role ? role.roleId : '';
	let history = useHistory();	

	useEffect(() => {
		console.log(appType);
		const getPermissionTemplate = async () => {
			fetch("/api/roles/permissions?applicationType="+appType, {
	      headers: authHeader()
	    })
	    .then(handleErrors)
	    .then(async (data) => {
	      let initialValues = [], roleDetails={};
	      let obj = {
	      	applicationType: appType	      	
	      }
	      setData(data);
	      if(roleId != '') {
	      	roleDetails = await getRoleDetails(roleId);
	      	obj.rolename = roleDetails.name;
	      	obj.description = roleDetails.description;
	      	obj.managedby = roleDetails.managedBy;
	      }

	      if(data) {
	      	let fields = [];
	      	if(data[0] && data[0].permissions && data[0].permissions.length > 0) {
		      	Object.keys(data[0].permissions).forEach((permissionKey, idx) => {
		      		data[0].permissions[permissionKey][Object.keys(data[0].permissions[permissionKey])[0]].forEach((permission) => {
		      			console.log(JSON.stringify(permission));
		      			console.log(permission.field_type);
		      			if(permission.field_type == 'radio') {
		      				let defaultValue = permission.ui_values.filter(uiValue => uiValue.default == true);
				      		if(roleDetails.permissions && roleDetails.permissions[permission.key]) {
				      			initialValues.push({[permission.key]: roleDetails.permissions[permission.key]});
				      		} else if(defaultValue && defaultValue.length > 0) {
				      			initialValues.push({[permission.key]: defaultValue[0].value});
				      		}
		      			} else {
				      		if(roleDetails.permissions && roleDetails.permissions[permission.key]) {
				      			initialValues.push({[permission.key]: roleDetails.permissions[permission.key]});
				      		}
		      			}
		      		})
		      	})
	      	}
	    	}
	      
	      let obj2 = Object.assign({}, obj, ...initialValues);
	      form.setFieldsValue(obj2)
		  });
	  };
			
		getPermissionTemplate();

  }, [appType])

  const getRoleDetails = async () => {
		return new Promise((resolve, reject) => {
			fetch("/api/roles?id="+roleId, {
	    	headers: authHeader()
	    })
			.then(handleErrors)
			.then(data => {      
	      setRoleDetails(data);
	      resolve(data)
	    }).catch(error => {
	    	console.log(error);
	    	reject(error);
	  	})
	  })
	}	
 
	const onFinish = values => {
		console.log(values);
    let keysToExclude = ["applicationType", "description", "managedby", "rolename"], permissions={};
    let postObj = {
    	applicationType: values.applicationType,
    	description: values.description,
    	managedBy: values.managedby,
    	name: values.rolename
    }
    if(roleDetails.id && roleDetails.id != '') {
    	postObj.id=roleDetails.id;
    }

    Object.keys(values).forEach((key) => {
    	if(!keysToExclude.includes(key) && values[key] != undefined) {
    		permissions[key] = values[key];
    	}
    })
		postObj.permissions = permissions;
    fetch('/api/roles', {
      method: (!postObj.id || postObj.id == '') ? 'post' : 'put',
      headers: authHeader(),
      body: JSON.stringify(postObj)
    })
		.then(handleErrors)
    .then(function(data) {
      message.success("Role has been saved successfully")
      history.push('/roles')
    }).catch(error => {
      console.log(error);
      message.error("There was an error saving the role")
    });	
  };

  const onTabChange = key => {
  	console.log(key)
  }

  const resetForm = () => {
  	form.resetFields();
  }

  const onCancel = () => {
  	history.push('/roles');
  }

  const getRadioSelectedValue = (key, uiValues) => {
  	let selectedValue = "";
  	//if a permission is already selected, then return that
  	if(roleDetails.permissions && roleDetails.permissions[key]) {
  		return roleDetails.permissions[key];
  	}

  	//look for default value
  	uiValues.filter((uiValue) => {
  		if(uiValue.default && uiValue.default==true) {
  			selectedValue = uiValue.displayValue;
  		}
  	})
  	return selectedValue;
	}

  return (
  	<React.Fragment>
	  	<Breadcrumb className="bread-crumb">
	      <Breadcrumb.Item>Role Details</Breadcrumb.Item>
	      <Breadcrumb.Item>{roleDetails ? roleDetails.name : 'New Role'}</Breadcrumb.Item>
	    </Breadcrumb>	    
	    {(data && data.length > 0) ? 
		    <Form {...layout} name="basic" onFinish={onFinish} form={form}>
			    <Tabs defaultActiveKey="1" type="card" onChange={onTabChange}>	  		
			    	<TabPane tab={"Role Info"} key={"roleInfo"} className="tab-content">		
			    		<Form.Item
				        label="Application Type"
				        name="applicationType"				        
        				rules={[{ required: true, message: 'Please select an Application Type!' }]}
				      >
				    		<Select id="applicationType" name="applicationType" placeholder="Application Type" style={{ width: 190 }} >
		              {Constants.APPLICATION_TYPES.map(applicationType => <Option key={applicationType} value={applicationType}>{applicationType}</Option>)}
		            </Select>
		          </Form.Item>
		            
			    		<Form.Item
				        label="Role Name"
				        name="rolename"
				        required
				        rules={[{ required: true, pattern: new RegExp(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/), message: 'Please enter role name!' }]}
				      >
				        <Input style={{"width": "400px"}}/>
				      </Form.Item>
			    		<Form.Item
				        label="Managed By"
				        name="managedby"
				        required
				        rules={[{ required: true, pattern: new RegExp(/^[a-zA-Z]{1}[a-zA-Z0-9@ \._-]*$/), message: 'Please enter managed by information!' }]}
				      >
				        <Input style={{"width": "400px"}}/>
				      </Form.Item>
			    		<Form.Item
				        label="Description"
				        name="description"
				      >
				        <TextArea rows={4} style={{"width": "400px"}}/>
				      </Form.Item>
			    	</TabPane>
			    	{
			    		data[0].permissions.map((permissionCategory, catIdx) => 	    			    			    		
				    		Object.keys(permissionCategory).map((category, idx) => 	    			
				    			<TabPane tab={category} key={category} className="tab-content" forceRender={true}>		    			
				    			{
					    			data[0].permissions[catIdx][category].map((permissionType) => 
					    				<React.Fragment>
						    				<Tooltip placement="rightTop" title={permissionType.description}><Title level={4}>{permissionType.name}</Title></Tooltip>
						    				<Paragraph>{permissionType.description}</Paragraph>
						    				<Form.Item name={permissionType.key}>
							    				{permissionType.field_type == 'radio' ?
							    					<Radio.Group name={permissionType.key} >
							    						{permissionType.ui_values.map((uiValue) => 
							    							<Tooltip placement="rightTop" key={uiValue.displayValue} title={uiValue.description}>
							    								<Radio value={uiValue.value}>{uiValue.displayValue}</Radio>  				
							    							</Tooltip>	
							    						)}										  	
							    					</Radio.Group>
				        					: <React.Fragment>				        							
					        						<Form.List name={permissionType.key}>
												        {(fields, { add, remove }) => {												        	
												          return (												          	
												            <div>												            
												              {fields.map((field, index) => (
												                <Form.Item										                  
												                  required={false}
												                  key={permissionType.key}												                  
												                >
												                  <span style={{"display": "-webkit-inline-box"}}>
													                  <Form.Item
													                    {...field}										                  

													                  >
													                    <Input placeholder="" name={permissionType.key}  style={{ width: '180px' }} />
													                  </Form.Item>  
													                    {fields.length > 1 ? (
													                    <MinusCircleOutlined
													                      className="dynamic-delete-button"
													                      style={{ margin: '0 8px' }}
													                      onClick={() => {
													                        remove(field.name);
													                      }}
													                    />
													                  ) : null}
													                  </span>
												                  
												                </Form.Item>
												              ))}
												              <Form.Item>
												                <Button
												                  type="dashed"
												                  onClick={() => {
												                    add();
												                  }}
												                  style={{ width: '90px' }}
												                >
												                  <PlusOutlined /> Add
												                </Button>										                
												              </Form.Item>
												            </div>
												          );
												        }}
												      </Form.List>
														    
							              </React.Fragment>
				        					}
				        				</Form.Item>	
						    			</React.Fragment>	
					    			)
					    		}					    				    		
				    			</TabPane>
				    		)	        	
			    	)}
		      </Tabs>
					<Row className="footer-buttons">
		      	<Col style={{"paddingRight": "10px"}}>  
			        <Button htmlType="button" onClick={onCancel}>
			          Cancel
			        </Button>
			      </Col>

			      <Col>  
			        <Button type="primary" htmlType="submit">
			          Submit
			        </Button>
			      </Col>  
		      </Row>
				</Form>
			: null }	
	  </React.Fragment>  
  );
}

export default RoleDetails