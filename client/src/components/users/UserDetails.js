import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Select, Tooltip, Row, Col, Typography, Spin, Popconfirm, Table, Divider, message, Modal } from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined, MenuOutlined  } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import { Constants } from '../common/Constants';
import { getColumnSearchProps } from '../common/TablesConfig';
import { useSelector } from "react-redux";
import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import { useHistory } from "react-router-dom";
import { authHeader, handleErrors } from "../common/AuthHeader.js"
import ReactJson from 'react-json-view'

const Option = Select.Option;
const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
  layout: "Vertical"
};

function UserDetails() {
	const [form] = Form.useForm();	
	let history = useHistory();	
	const [applicationsData, setApplicationsData] = useState({data:[], value:[], applicationFetching: false});
	const [rolesData, setRolesData] = useState({data:[], value:[], roleFetching: false});
	const [applications, setApplications] = useState([]);
	const [roles, setRoles] = useState([]);
	const [appRoles, setAppRoles] = useState([]);	
	const [userDetails, setUserDetails] = useState([]);	
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [isSelected, setIsSelected] = useState(false);
	const [previewDialogVisible, setPreviewDialogVisible] = useState(false);
	const [permissionsPreviewContent, setPermissionsPreviewContent] = useState({});
	const userReducer = useSelector(state => state.userReducer);	
	const DragHandle = sortableHandle(() => (
	  <MenuOutlined style={{ cursor: 'pointer', color: '#999' }} />
	));
	const SortableItem = sortableElement(props => <tr {...props} />);
	const SortableContainer = sortableContainer(props => <tbody {...props} />);

	let user = userReducer.user;
	let lastFetchId;	
	
	useEffect(() => {		
		getApplications();
		getRoles();	
  }, [])

  useEffect(() => {				
		console.log(user)
		if(!user) {
			console.log('redirecting');
			history.push('/users');
		}

		if(user && user.userId != '') {
			getUserDetails(user.userId)				
		} 

  }, [user])  

	const getUserDetails = (userId) => {
  	fetch("/api/users/details?id="+userId, {
      headers: authHeader()
    })
    .then(handleErrors)    
    .then(data => {
    	let appRole=[], appRoleObj={};
    	setUserDetails(data);
      form.setFieldsValue({
      	firstName: data.firstName,
	    	lastName: data.lastName,
	    	email: data.email,
	    	username: data.username,
	    	employeeId: data.employeeId,
	    	userType: data.type
      })
      data.Roles.forEach((role, idx) => {      	
      	appRoleObj = {
      		priority: role.User_Roles.priority,
      		roleId: role.id,
      		roleName: role.name,
      		appId: role.User_Roles.applicationId
      	};

      	let application = data.Applications.filter(application => application.id == role.User_Roles.applicationId);
      	if(application) {
      		appRoleObj.appName = application[0].name;
      	}
				appRole.push(appRoleObj);    				  	      	
      })
      appRole.sort(function(a, b) {
			  return a.priority - b.priority;
			});
      setAppRoles(appRole);
    }).catch(error => {
      console.log(error);
    });			
  }  

	const onFinish = values => {
    let postObj = {
    	firstName: values.firstName,
    	lastName: values.lastName,
    	email: values.email,
    	username: values.username,
    	password: values.password,
    	confirmPassword: values.confirmPassword,
    	employeeId: values.employeeId,
    	type: values.userType,
    	appRoles: appRoles
    }
    fetch('/api/users/user', {
      method: postObj.id == '' ? 'post' : 'post',
      headers: authHeader(),
      body: JSON.stringify(postObj)
    })
    .then(handleErrors)
		.then(function(data) {
      message.success("User has been saved successfully")
      resetForm();
      history.push("/users");
    }).catch(error => {
      console.log(error);
      message.error("There was an error saving the User")
    });	
  };  
  
  const onCancel = () => {
    history.push('/users');
  }

  const getApplications = () => {
  	fetch("/api/application/all", {
     	headers: authHeader()
    })
    .then(handleErrors)    
    .then(data => {
      setApplications(data);
    }).catch(error => {
      console.log(error);
    });		
  }

  const getRoles = () => {
  	fetch("/api/roles/all", {
      headers: authHeader()
    })
    .then(handleErrors)
    .then(data => {
      setRoles(data);      
    }).catch(error => {
      console.log(error);
    });			
  }

  const handleApplicationChange = value => {
    setApplicationsData({
      value,
      data: [],
      fetching: false,
    });
  };

  const handleRoleChange = value => {
    setRolesData({
      value,
      data: [],
      fetching: false,
    });
  };

  const fetchApplications = value => {
    lastFetchId += 1;
    const fetchId = lastFetchId;
    setApplicationsData({ data: [], fetching: true });
    
    const filteredData = applications.map((application) => {
    	if(application.name.includes(value)) {
    		console.log("matched")
    		return {"text": application.name, "value": application.key}
    	}
    })
    setApplicationsData({ data: filteredData, fetching: false });
  };

  const fetchRoles = value => {
    lastFetchId += 1;
    const fetchId = lastFetchId;
    setRolesData({ data: [], fetching: true });
    
    const filteredData = roles.map((role) => {
    	if(role.name.includes(value)) {
    		return {"text": role.name, "value": role.key}
    	}
    })
    setRolesData({ data: filteredData, fetching: false });
  };

  const handleRoleDelete = (priority) => {
  	let afterDelete = appRoles.filter(appRole => appRole.priority != priority)
  	setAppRoles(afterDelete)
  }

  const addApplicationRole = () => {
  	let appRolesNew = {
  		priority: appRoles.length + 1,
  		appId: applicationsData.value.key,
  		appName: applicationsData.value.label,
  		roleId: rolesData.value.key,
  		roleName: rolesData.value.label  		
  	};
  	let newData = [...appRoles, appRolesNew];
  	let duplicateAppRole = appRoles.filter(appRole => appRole.appId == applicationsData.value.key && appRole.roleId == rolesData.value.key);
  	if(duplicateAppRole && duplicateAppRole.length > 0) {
  		message.error("Application and Role already added for this user. Please select a different Application/Role");
  	} else {
	  	setAppRoles(newData);
	  	handleRoleChange('');
	  	handleApplicationChange('')

  	}
  }

  const resetForm = () => {
  	form.resetFields();
  }  

  const handlePreviewClose = () => {
  	setPreviewDialogVisible(false);
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      let newData = arrayMove([].concat(appRoles), oldIndex, newIndex).filter(el => !!el);
      newData = newData.map((data, idx) => {
      	data.priority = idx + 1;
      	return data;
      })
      console.log('Sorted items: ', newData);
      setAppRoles(newData);
    }
  };

  const DraggableBodyRow = ({ className, style, ...restProps }) => {    
    // function findIndex base on Table rowKey props and should always be a right array index
    const priority = appRoles.findIndex(x => x.priority === restProps['data-row-key']);
    return <SortableItem index={priority} {...restProps} />;
  };  

  const onSelectChange = (selectedRowKeys, selectedRows) => {
  	console.log(selectedRows)
    setSelectedRowKeys(selectedRowKeys);    
    setSelectedRows(selectedRows);    
    if(selectedRowKeys && selectedRowKeys.length > 1) {
    	setIsSelected(true);
    } else {
    	setIsSelected(false);
    }
  };

	const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  const showPreview = () => {
  	console.log(selectedRows)
  	let appId='', foundDifferentApp = false, roleIds=[];
  	selectedRows.forEach((selectedRow) => {
  		roleIds.push(selectedRow.roleId);
  		if(!appId == '') {
  			if(appId != selectedRow.appId)	{
					foundDifferentApp = true;
					return;
  			}  			
  		};
  		appId = selectedRow.appId;
  	})

  	console.log(foundDifferentApp)
  	if(foundDifferentApp) {
  		//message.error("Please select Roles of the same application to Preview the permissions.")
  	} else {  
	  	let url = '/api/auth/v20/previewPermissions?roleIds='+roleIds.join(',');
	  	fetch(url, {
	      headers: authHeader()
	    })
	    .then(handleErrors)
	    .then(data => {
	      setPermissionsPreviewContent(data.permissions);
	      setPreviewDialogVisible(true);

	    }).catch(error => {
	      console.log(error);
	    });		
	 	}	 		
  }


  const DraggableContainer = props => (
    <SortableContainer
      useDragHandle
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );


	const columns = [
  {
    title: 'Sort',
    dataIndex: 'sort',
    width: 30,
    className: 'drag-visible',
    render: () => <DragHandle />,
  },
  {
    title: 'Application',
    dataIndex: 'appName',
    key: 'appName',
    className: 'drag-visible',
    ...getColumnSearchProps('applicationType'),
    render: (text, record) => <a href='#' >{text}</a>
  },
  {
    title: 'Role',
    key: 'roleName',
    ...getColumnSearchProps('applicationType'),
    dataIndex: 'roleName',
  },
  {
    title: 'Priority',
    key: 'priority',
    ...getColumnSearchProps('priority'),
    dataIndex: 'priority',
  },
  {
    title: 'Action',
    dataIndex: '',
    render: (text, record) =>
      <span>
        <Popconfirm title="Are you sure you want to delete this application/role?" onConfirm={() => handleRoleDelete(record.priority)}> 
          <a href="#"><Tooltip placement="right" title={"Delete"}><DeleteOutlined /></Tooltip></a>
        </Popconfirm>        
      </span>
  }];  

  return (    
  	<React.Fragment>
	  	<Breadcrumb className="bread-crumb">
	      <Breadcrumb.Item>User Details</Breadcrumb.Item>
	    </Breadcrumb>	    

      <Form        
        name="basic"
        onFinish={onFinish}                
        {...layout}
        form={form}
      >
        <Row gutter={16}>
        	<Col span={8}>
		        <Form.Item
		          label="First Name"
		          name="firstName"
		          rules={[{ required: true, message: 'Please enter first name!' }]}		          
		        >
		          <Input />
		        </Form.Item>
		      </Col>
		      <Col span={8}>  
		        <Form.Item
		          label="Last Name"
		          name="lastName"
		          rules={[{ required: true, message: 'Please enter last name!' }]}		          
		        >
		          <Input />
		        </Form.Item>
		      </Col>  
        </Row>
        <Row gutter={16}>
        	<Col span={8}>
		        <Form.Item
		          label="User Name"
		          name="username"
		          required
		          rules={[{ required: true, message: 'Please enter user name!' }]}
		        >
		        	<Input />
		        </Form.Item>
		      </Col>
		      <Col span={8}>  
		        <Form.Item
		          label="Employee Id"
		          name="employeeId"		          
		        >
		          <Input />
		        </Form.Item>
		      </Col>
	      </Row>  
	      {!userDetails || userDetails.length == 0 ? 
	        <Row gutter={16}>
	        	<Col span={8}>
			        <Form.Item
			          label="Password"
			          name="password"
			          required
			          tooltip={<Tooltip><span>Password has to be atleast 4 characters long!.</span></Tooltip>}			          
			          rules={[{ min: 4, message: 'Password has to be atleast 4 characters long!'}, { required: true, message: 'Please enter password!' }]}
			        >
			        	<Input type="password"/>
			        </Form.Item>
			      </Col>
			      <Col span={8}>  
			        <Form.Item
			          label="Confirm Password"
			          name="confirmPassword"		 
			          required
			          rules={[{ required: true, message: 'Please confirm password!' }, { min: 4, message: 'Password has to be atleast 4 characters long!' }]}         
			        >
			          <Input type="password"/>
			        </Form.Item>
			      </Col>
		      </Row>  
		    : null}  
	      <Row gutter={16}>
        	<Col span={8}>
		        <Form.Item
		          label="Email"
		          name="email"
		          required
		          rules={[{ required: true, message: 'Please enter email!' }]}
		        >
		        	<Input type="text"/>
		        </Form.Item>
					</Col>
		      <Col span={8}>  		        
		      <Form.Item
		          label="User Type"
		          name="userType"		 
		          required
		          rules={[{ required: true, message: 'Please select user type!' }]}         
		        >
		          <Select id="userType" value={"Application Type"} placeholder="User Type" style={{ width: 190 }} >
                {Constants.USER_TYPE.map(userType => <Option key={userType}>{userType}</Option>)}
              </Select>
		        </Form.Item>
		      </Col>
		      <Divider type="horizontal" />      	
	      </Row>  
        <Row gutter={16}>
        	<Title level={5}>Applications/Roles</Title>
        </Row>	

        <Row gutter={14}>
        	<Col span={7}>  
		        <Select
			        mode="single"
			        labelInValue
			        value={applicationsData.value}
			        placeholder="Select application"
			        notFoundContent={applicationsData.fetching ? <Spin size="small" /> : null}
			        filterOption={false}
			        onSearch={fetchApplications}
			        onChange={handleApplicationChange}
			        style={{ width: '80%' }}
			      >
			        {applications.map(d => (
			          <Option key={d.id}>{d.name}</Option>
			        ))}
		      	</Select>
		    	</Col>  

		    	<Col span={7}>  
		        <Select
			        mode="single"
			        labelInValue
			        value={rolesData.value}
			        placeholder="Select role"
			        notFoundContent={rolesData.fetching ? <Spin size="small" /> : null}
			        filterOption={false}
			        onSearch={fetchRoles}
			        onChange={handleRoleChange}
			        style={{ width: '80%' }}
			      >
			        {roles.map(d => (
			          <Option key={d.id}>{d.name}</Option>
			        ))}
		      	</Select>
		    	</Col>  

		    	<Col>  
		    		<Button icon={<PlusOutlined />} onClick={addApplicationRole}>Add</Button>
		    	</Col>
		    	<Divider type="horizontal" />      	
        </Row>      

	      <div>
	        <div style={{ marginBottom: 16 }}>
	          <Button type="primary" onClick={showPreview} disabled={!isSelected}>
	            Preview
	          </Button>
	        </div>
		      <Table 
		      	rowSelection={rowSelection}
		      	onChange={onSelectChange}
		      	dataSource={appRoles} 
		      	columns={columns} 
		      	rowKey="priority"
		      	title={() => 'Roles are processed in priority order; the lower the number, the higher the priority. To change the priority of roles within an application, re-arrange the rows by dragging and moving them.'}
		        components={{
		          body: {
		            wrapper: DraggableContainer,
		            row: DraggableBodyRow,
		          },
		        }}
		      	/>
      </div>

      <Modal
          title="Permissions Preview"
          visible={previewDialogVisible}
          onCancel={handlePreviewClose}
          footer={[
            <Button key="back" onClick={handlePreviewClose}>
              Close
            </Button>
          ]}
        >
        <ReactJson src={permissionsPreviewContent} displayDataTypes={false}/>
      </Modal>  

	      <Row className="footer-buttons">
	      	<Col style={{"padding-right": "10px"}}>  
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

	  </React.Fragment>  
  );
}

export default UserDetails