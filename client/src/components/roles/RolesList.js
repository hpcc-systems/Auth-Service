import React, { useState, useEffect } from 'react'
import { Table, Tooltip, Divider, Popconfirm, Button, Menu, Dropdown, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import { getColumnSearchProps } from '../common/TablesConfig';
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { roleActions } from '../../redux/actions/Role';
import { EditOutlined, DeleteOutlined, FileAddOutlined, DownOutlined } from '@ant-design/icons';
import { authHeader } from "../common/AuthHeader.js"

function RolesList() {
	let history = useHistory();	
  const roleReducer = useSelector(state => state.roleReducer);
  const dispatch = useDispatch();
  const [data, setData] = useState([]);

  useEffect(() => {		
		getRoleList()	
  }, [])

  const getRoleList = () => {
  	fetch("/api/roles/all", {
      headers: authHeader()
    })
    .then((response) => {
      if(response.ok) {
        return response.json();
      }        
    })
    .then(data => {
      setData(data);      
    }).catch(error => {
      console.log(error);
    });			
  }

	const handleEdit = (record) => {
    dispatch(roleActions.roleSelected(
    	record.id,
    	record.applicationType
    ));

		history.push("/role/details");
	}

	const handleDelete = (record) => {
		fetch('/api/roles?id='+record.id, {
      method: 'delete',
      headers: authHeader()
    }).then(function(response) {
      if(response.ok) {
        return response.json();
      } else {
        message.error("There was an error deleting the Role")
      }
    }).then(function(data) {
      message.success("Role has been deleted")
      getRoleList();
    });
	}

	const handleMenuClick = (e) => {
		dispatch(roleActions.roleSelected(
    	'',
    	e.key
    ));
		history.push("/role/details");
	}

	const menu = (
	  <Menu onClick={handleMenuClick}>
	    <Menu.Item key="HPCC">HPCC Role</Menu.Item>
	    <Menu.Item key="Tombolo">Tombolo Role</Menu.Item>
	    <Menu.Item key="RealBI">RealBI Role</Menu.Item>
	  </Menu>
	);	

	const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    ...getColumnSearchProps('name'),
    render: (text, record) => <a href='#' onClick={(row) => handleEdit(record)}>{text}</a>
  },
  {
    title: 'Application Type',
    dataIndex: 'applicationType',
    key: 'applicationType',
    ...getColumnSearchProps('applicationType')
  },
  {
    title: 'Managed By',
    dataIndex: 'managedBy',
    key: 'address',
    ...getColumnSearchProps('managedBy'),
  },
  {
    title: 'Created',
    dataIndex: 'createdAt',
    key: 'createdAt'
  },
  {
	  title: 'Action',
	  dataIndex: '',
	  render: (text, record) =>
	    <span>
	      <a href="#" onClick={(row) => handleEdit(record)}><Tooltip placement="right" title={"View Details"}><EditOutlined /></Tooltip></a>
        <Divider type="vertical" />
        <Popconfirm title="Are you sure you want to delete this role?" onConfirm={() => handleDelete(record)}> 
          <a href="#"><Tooltip placement="right" title={"Delete Role"}><DeleteOutlined /></Tooltip></a>
        </Popconfirm>

	    </span>
  }

];

	return (
	  <React.Fragment>
		  	<Breadcrumb className="bread-crumb">
	        <Breadcrumb.Item>Roles</Breadcrumb.Item>
	      </Breadcrumb>
      	<Tooltip title="Add Role">
      		<Dropdown overlay={menu} className="add-button">
			      <Button>
			        Add <DownOutlined />
			      </Button>
			    </Dropdown>
    		</Tooltip>
	  	<Table dataSource={data} columns={columns} rowKey={"id"}/>
    </React.Fragment>
	  )  
}

export default RolesList
