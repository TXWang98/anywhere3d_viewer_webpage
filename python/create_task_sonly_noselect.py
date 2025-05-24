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


sqa_file = './dump/ec2/data_s_noaug.bson'

def main():
    random.seed(time.time())

    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient['sqa3d']
    task_db = 'SQA3D_tasks_sonlynoselect_shortrun_test'
    target_db = 'SQA3D_data_sonlynoselect_shortrun_test'
    task_type = 4 # sonly-noselect
    max_response = 5
    repeat = 2
    topk = 50

    # preprocess
    sqa_d = {}
    with open(sqa_file, 'rb') as bf:
        data = bson.decode_all(bf.read())
    for i in data:
        if i['scene_id'] not in sqa_d:
            sqa_d[i['scene_id']] = [i]
        else:
            sqa_d[i['scene_id']].append(i)
    sqa_pack = []
    tmp = []
    for k, v in sqa_d.items():
        for i in v:
            if len(tmp) == max_response:
                sqa_pack.append(tmp)
                tmp = []
            tmp.append(i)
        else:
            if len(tmp) == max_response:
                sqa_pack.append(tmp)
            else:
                print('Trailing {} sqas from scene {} dropped'.format(len(tmp), k))
            tmp = []

    # sqa_pack = sqa_pack[:topk]

    print('This will create {} tasks'.format(len(sqa_pack)*repeat))
    print('Continue?')
    s = input('(Y/N): ')
    if s == 'Y' or s == 'y':
        mycol = mydb[task_db]
        mycol.drop()
        with open('./data_sonly_noselect.txt', 'w') as f:
            for _ in range(repeat):
                for sqas in sqa_pack:
                    task = {
                        'scene_id': sqas[0]['scene_id'],
                        'task_db': task_db,
                        'sqa_db_collection_name': target_db,
                        'task_type': task_type,
                        'max_response': max_response,
                        'cur_response': 0,
                        'agent_rot': [i['agent_rot'] for i in sqas],
                        'agent_pos': [i['agent_pos'] for i in sqas],
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
        print('please check data_sonly_noselect.txt')
    else:
        print('Aborted.')

if __name__ == '__main__':
    main()
