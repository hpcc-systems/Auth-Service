import React, { useState, useEffect } from 'react'
import { getColumnSearchProps } from '../common/TablesConfig';
import { Table, Tooltip, Divider, Popconfirm, Button, message } from 'antd';
import { Breadcrumb } from 'antd';
import { EditOutlined, DeleteOutlined, FileAddOutlined } from '@ant-design/icons';
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userActions } from '../../redux/actions/User';
import { authHeader, handleErrors } from "../common/AuthHeader.js"
import { Constants } from '../common/Constants';

function UsersList() {
	let history = useHistory();	
	const dispatch = useDispatch();
	const [data, setData] = useState([]);
	
	useEffect(() => {		
		getUserList()	
  }, [])


  const getUserList = () => {
  	fetch("/api/users/all", {
      headers: authHeader()
    })
    .then(handleErrors)
    .then(data => {
      setData(data);      
    }).catch(error => {
      console.log(error);
    });			
  }

	const handleEdit = (record) => {
    dispatch(userActions.userSelected(
    	record.id
    ));

		history.push("/user/details");
	}

	const handleAdd = () => {
		dispatch(userActions.userSelected(
    	''
    ));
		history.push("/user/details");
	}

	const handleDelete = (record) => {
		fetch('/api/users/delete?id='+record.id, {
      method: 'delete',
      headers: authHeader(),
    })
		.then(handleErrors)
    .then(function(data) {
      message.success("User has been deleted")
      getUserList();
    }).catch(error => {
      console.log(error);
      message.error("There was an error in deleting the Role")
    });	
	}
	

	const columns = [
  {
    title: 'Name',
    dataIndex: 'firstName',
    key: 'firstName',
    ...getColumnSearchProps('firstName'),    
    render: (text, record) => <a href='#' onClick={(row) => handleEdit(record)}>{record.firstName + " " + record.lastName}</a>
  },
  {
    title: 'User Name',
    dataIndex: 'username',
    key: 'username',
    ...getColumnSearchProps('username')
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    ...getColumnSearchProps('email'),
  },
  {
    title: 'Created',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (text, record) => {
      let createdAt = new Date(text);
      return createdAt.toLocaleDateString('en-US', Constants.DATE_FORMAT_OPTIONS) +' @ '+ createdAt.toLocaleTimeString('en-US') 
    }
  },
  {
    title: 'Action',
    dataIndex: '',
    render: (text, record) =>
      <span>
        <a href="#" onClick={(row) => handleEdit(record)}><Tooltip placement="right" title={"View Details"}><EditOutlined /></Tooltip></a>
        <Divider type="vertical" />
          <Popconfirm title="Are you sure you want to delete this user?" onConfirm={() => handleDelete(record)}> 
            <a href="#"><Tooltip placement="right" title={"Delete User"}><DeleteOutlined /></Tooltip></a>
          </Popconfirm>
      </span>
  }  
];

	return (
	  <React.Fragment>
	  	<Breadcrumb className="bread-crumb">
	        <Breadcrumb.Item>Users</Breadcrumb.Item>
	      </Breadcrumb>
      	<Tooltip title="Add User">
      		<Button className="add-button" icon={<FileAddOutlined />} onClick={handleAdd}>Add</Button>
    		</Tooltip>
	  	<Table dataSource={data} columns={columns} rowKey={"id"}/>
    </React.Fragment>
	  )  
}

export default UsersList
