#!/usr/bin/env python
# -*- coding:UTF-8 -*-

import glob
import json
import pymongo
import random
import hashlib
import time


# scene_list = [
#     '0142',
#     '0640',
#     '0517',
#     '0628',
#     '0048',
#     '0019'
# ]

scene_level = json.load(open('./dump/scene/scene_level.json', 'r'))
scene_list_l1 = scene_level['l1'][:40]
scene_list = scene_level['l1'][:40] + scene_level['l2'][:50] + scene_level['l3'][:50]

def main():
    random.seed(time.time())

    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient['sqa3d']
    task_db = 'SQA3D_tasks_sonly_fullrun1'
    target_db = 'SQA3D_data_sonly_fullrun1'
    task_type = 1 # sonly
    max_response = 5
    repeat = 2

    print('This will create {} tasks'.format(len(scene_list)*repeat + len(scene_list_l1)))
    print('Continue?')
    s = input('(Y/N): ')
    if s == 'Y' or s == 'y':
        mycol = mydb[task_db]
        mycol.drop()
        with open('./data_sonly.txt', 'w') as f:
            for _ in range(repeat):
                for scene_id in scene_list:
                    task = {
                        'scene_id': 'scene{}_00'.format(scene_id),
                        'task_db': task_db,
                        'sqa_db_collection_name': target_db,
                        'task_type': task_type,
                        'max_response': max_response,
                        'cur_response': 0,
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

            # Extra for l1
            for scene_id in scene_list_l1:
                task = {
                    'scene_id': 'scene{}_00'.format(scene_id),
                    'task_db': task_db,
                    'sqa_db_collection_name': target_db,
                    'task_type': task_type,
                    'max_response': max_response,
                    'cur_response': 0,
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
        print('please check data_sonly.txt')
    else:
        print('Aborted.')

if __name__ == '__main__':
    main()
