import React, { useState, useEffect } from 'react'
import { Breadcrumb } from 'antd';
import { Table, Tooltip, Popconfirm, Divider, Button, message } from 'antd';
import { getColumnSearchProps } from '../common/TablesConfig';
import { EditOutlined, DeleteOutlined, FileAddOutlined  } from '@ant-design/icons';
import ApplicationDetailsDialog from './ApplicationDetailsDialog';
import useModal from '../../hooks/useModal';

function ApplicationsList() {
  const {isShowing, toggle} = useModal();
  const [data, setData] = useState([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState('');

  useEffect(() => {		
		fetchApplications();			
  }, [])

  const fetchApplications = () => {
  	fetch("/api/application/all", {
      //headers: authHeader()
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

	const handleEdit = (id) => {		
		setSelectedApplicationId(id);		
		toggle();
	}

	const handleDelete = (id) => {
		fetch('/api/application?id='+id, {
      method: 'delete',
      //headers: authHeader(),
      headers: { 
        "Content-type": "application/json; charset=UTF-8"
      }
    }).then(function(response) {
      if(response.ok) {
        return response.json();
      } else {
        message.error("There was an error deleting the Application")
      }
    }).then(function(data) {
      message.success("Application has been deleted")
      fetchApplications();
    });
	}

	const handleClose = () => {
		toggle();
		fetchApplications();
		setSelectedApplicationId('');
	}

	const addApplication = () => {
		toggle();
	}
	
	const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    ...getColumnSearchProps('name'),
    render: (text, record) => <a href='#' onClick={(row) => handleEdit(record.id)}>{text}</a>
  },
  {
    title: 'Application Type',
    dataIndex: 'applicationType',
    key: 'applicationType',
    ...getColumnSearchProps('applicationType')
  },
  {
    title: 'Client Id',
    dataIndex: 'clientId',
    key: 'clientId',
    ...getColumnSearchProps('clientId')
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'address',
    ...getColumnSearchProps('description'),
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
        <a href="#" onClick={(row) => handleEdit(record.id)}><Tooltip placement="right" title={"View Details"}><EditOutlined /></Tooltip></a>
        <Divider type="vertical" />
        <Popconfirm title="Are you sure you want to delete this application?" onConfirm={() => handleDelete(record.id)}> 
          <a href="#"><Tooltip placement="right" title={"Delete Application"}><DeleteOutlined /></Tooltip></a>
        </Popconfirm>        
      </span>
  }
];

	return (
	  <React.Fragment>
	  	<span>
		  	<Breadcrumb className="bread-crumb">
	        <Breadcrumb.Item>Applications</Breadcrumb.Item>
	      </Breadcrumb>
      	<Tooltip title="Add Application">
      		<Button className="add-button" icon={<FileAddOutlined />} onClick={addApplication}>Add</Button>
    		</Tooltip>
      </span>	
      <Table dataSource={data} columns={columns} />

      <ApplicationDetailsDialog isShowing={isShowing} onClose={handleClose} selectedApplicationId={selectedApplicationId}/>
    </React.Fragment>
	  )  
}

export default ApplicationsList
