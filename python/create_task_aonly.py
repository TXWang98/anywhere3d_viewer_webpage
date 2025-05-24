#!/usr/bin/env python
# -*- coding:UTF-8 -*-

import glob
import json
import pymongo
import random
import hashlib
import time
import bson


sqa_file = './dump/sqa3d/SQA3D_type1.bson'

def main():
    random.seed(time.time())

    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient['sqa3d']
    task_db = 'SQA3D_tasks_aonly_shortrun'
    target_db = 'SQA3D_data_aonly_shortrun'
    task_type = 3 # aonly
    max_response = 1
    repeat = 2
    topk = 50

    with open('./data_aonly.txt', 'w') as f, open(sqa_file, 'rb') as bf:
        sqa = bson.decode_all(bf.read())
        if topk > 0:
            sqa = sqa[:topk]

        print('This will create {} tasks'.format(topk*repeat))
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
                        'question': entry['question'],
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
            print('please check data_aonly.txt')
        else:
            print('Aborted.')

if __name__ == '__main__':
    main()
