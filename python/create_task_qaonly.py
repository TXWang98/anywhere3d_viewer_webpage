#!/usr/bin/env python
# -*- coding:UTF-8 -*-

import glob
import json
import pymongo
import random
import hashlib
import time
import bson
import pickle


sqa_file = './dump/ec2/data_s.bson'

def main():
    random.seed(time.time())

    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient['sqa3d']
    task_db = 'SQA3D_tasks_qaonly_fullrun1'
    target_db = 'SQA3D_data_qaonly_fullrun1'
    task_type = 2 # qaonly
    max_response = 5
    repeat = 1
    start = 0 # 100
    end = 10 # 150

    with open('./data_qaonly.txt', 'w') as f, open(sqa_file, 'rb') as bf:
        sqa = bson.decode_all(bf.read())
        sqa = sqa[start:end]

        # print('This will create {} tasks'.format((end-start)*repeat))
        print('This will create {} tasks'.format(len(sqa)*repeat))
        print('Continue?')
        s = input('(Y/N): ')
        if s == 'Y' or s == 'y':
            mycol = mydb[task_db]
            mycol.drop()
            for _ in range(repeat):
                for entry in sqa:
                    task = {
                        'scene_id': entry['scene_id'],
                        'task_db': task_db,
                        'sqa_db_collection_name': target_db,
                        'task_type': task_type,
                        'max_response': max_response,
                        'cur_response': 0,
                        'agent_rot': entry['agent_rot'],
                            'agent_pos': entry['agent_pos'],
                            'situation': entry['situation'],
                    }

                    salt1 = str(random.random())
                    salt2 = str(random.random())
                    hash1 = str(hashlib.md5((str(task)+salt1).encode()).hexdigest())
                    hash2 = str(hashlib.md5((str(task)+salt2).encode()).hexdigest())
                    task['hash1'] = hash1
                    task['hash2'] = hash2

                    url = 'http://3.101.107.11:8080/apps/amthit/id={}&task_db={}'.format(hash1, task_db)

                    mycol.insert_one(task)
                    j = {"url": url}
                    json.dump(j, f)
                    f.write('\n')

            res = mycol.find({})
            for x in res:
                print(x)
            print('please check data_qaonly.txt')
        else:
            print('Aborted.')

if __name__ == '__main__':
    main()
