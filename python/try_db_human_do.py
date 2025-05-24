import glob
import os.path as osp
import json
import pymongo
import argparse
import pandas as pd



def main():
    
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient['sqa3d']
    collections = mydb.list_collection_names()
    print(collections)
    #print("scannet_objects_full:", mydb['scannet_objects_full'])
    collection = mydb['annotation_result_human_do']
    #print(documents)
    #print(mydb)
    documents = collection.find()
    cnt = 0
    document_list = []

   
    for document in documents:
        cnt += 1
        #print(document)
        document_list.append(document)
    
    print(document_list[-1])
    print(cnt)
    
    #collection = mydb['multiscan']


if __name__ == '__main__':
    main()

