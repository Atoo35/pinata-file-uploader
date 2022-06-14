import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react';
import axios from 'axios'

export default function Home() {

  const [pinnedFiles, setPinnedFiles] = useState()
  const [file, setFile] = useState();
  const pinataConfig = {
    root: 'https://api.pinata.cloud',
    headers: { 
      'pinata_api_key': process.env.API_KEY,
      'pinata_secret_api_key': process.env.API_SECRET
    }
  };

  const queryPinataFiles = async () => {
    try {
      const url = `${pinataConfig.root}/data/pinList`;
      const response = await axios.get(url, pinataConfig);
      const files = response.data.rows.filter(file => file.date_unpinned === null);
      console.log(files)
      setPinnedFiles(files);
    } catch (error) {
      console.log(error)
    }
  };

  const handleUpload = async () => {
    try {
      if(file !== undefined){
        const formData = new FormData();
        console.log(file)
        formData.append('file', file);
        const pinataBody = {
          options:{
            cidVersion: 1,
          },
          metadata:{
            name: file.name,
          }
        }
        formData.append('pinataOptions',JSON.stringify(pinataBody.options));
        formData.append('pinataMetadata', JSON.stringify(pinataBody.metadata));
        const url = `${pinataConfig.root}/pinning/pinFileToIPFS`;
        const response = await axios({
          method: 'post',
          url: url,
          data: formData,
          headers: pinataConfig.headers
        })
        console.log(response.data)
        queryPinataFiles();
      } else {
        alert('select file first')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const testPinataConnection = async() =>{
    try {
      const url =`${pinataConfig.root}/data/testAuthentication`
      const res = await axios.get(url, {headers: pinataConfig.headers});
      console.log(res.data);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    testPinataConnection()
    queryPinataFiles()
  },[]);

  return (
    <div className={styles.container}>
      <input type='file' onChange={(e)=>setFile(e.target.files[0])}></input>
      <button onClick={handleUpload}>Upload</button>
      <ul>
        {
          pinnedFiles && pinnedFiles.map(file => (
            <li key={file.id}>
              <a href={`https://gateway.pinata.cloud/ipfs/${file.ipfs_pin_hash}`} target='_blank'>{file.metadata.name}</a>
            </li>
          ))
          
        }
      </ul>
    </div>
  )
}
