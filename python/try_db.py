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
    collection = mydb['annotation_result']
    #print(documents)
    #print(mydb)
    documents = collection.find()
    document_list = []


    cnt = 0
    for document in documents:
        if (document['datasetname'] == "arkitscene_valid" and document['scene_id'] == 'scene0020_00'):
        #print(document)
        # if document['cur_referring_expressions_cnt'] != '09' and document['cur_referring_expressions_cnt'] != '08':
            cnt += 1
            document_list.append(document)
            #print(document)
    print("cnt", cnt)
    print(document_list[-1])
    
    #collection = mydb['multiscan']


if __name__ == '__main__':
    main()

