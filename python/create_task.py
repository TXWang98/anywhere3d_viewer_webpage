#!/usr/bin/env python
# -*- coding:UTF-8 -*-

import glob
import json
import pymongo


def main():
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient['sqa3d']
    task_db = 'SQA3D_tasks'
    mycol = mydb[task_db]
    mycol.drop()

    mycol.insert_one({
        'hash1': '23d1',
	    'hash2': '45fd',
        'task_db': task_db,
        'scene_id': 'scene0000_00',
	    'sqa_db_collection_name': 'test_stage',
	    'task_type': '1',
        'max_response': 5,
        'cur_response': 0,
	    # 'agent_rot':,
	    # 'agent_pos',
	    # 'situation',
	    # 'question',
    })
    # mycol.insert_one({
    #     'hash1': '23e1',
    #         'hash2': '45fe',
    #     'task_db': task_db,
    #     'scene_id': 'scene0001_00',
    #         'sqa_db_collection_name': 'test_stage',
    #         'task_type': '1',
    #     'max_response': 5,
    #     'cur_response': 0,
    #         # 'agent_rot':,
    #         # 'agent_pos',
    #         # 'situation',
    #         # 'question',
    # })


    mycol.insert_one({
        'hash1': '23d8',
	    'hash2': '45ft',
        'task_db': task_db,
        'scene_id': 'scene0000_00',
	    'sqa_db_collection_name': 'test_stage',
	    'task_type': '2',
        'max_response': 5,
        'cur_response': 0,
	    'agent_rot': {'_x': 0, '_y': 0, '_z': -0.9635581854171914, '_w': 0.26749882862458696},
	    'agent_pos': {'x': 1.3522363260004358, 'y': 2.634134054770714, 'z': 0},
	    'situation': "I'm heating my food where there is a fridge on my right",
	    # 'question',
    })
    # mycol.insert_one({
    #     'hash1': '23d9',
    #         'hash2': '45fw',
    #     'task_db': task_db,
    #     'scene_id': 'scene0001_00',
    #         'sqa_db_collection_name': 'test_stage',
    #         'task_type': '2',
    #     'max_response': 5,
    #     'cur_response': 0,
    #         'agent_rot': {'_x': 0, '_y': 0, '_z': -0.9635581854171914, '_w': 0.26749882862458696},
    #         'agent_pos': {'x': 1.3522363260004358, 'y': 2.634134054770714, 'z': 0},
    #         'situation': "I'm heating my food where there is a fridge on my right",
    #         # 'question',
    # })


    mycol.insert_one({
        'hash1': '23d0',
	    'hash2': '45fy',
        'task_db': task_db,
        'scene_id': 'scene0000_00',
	    'sqa_db_collection_name': 'test_stage',
	    'task_type': '3',
        'max_response': 1,
        'cur_response': 0,
	    'agent_rot': {'_x': 0, '_y': 0, '_z': -0.9635581854171914, '_w': 0.26749882862458696},
	    'agent_pos': {'x': 1.3522363260004358, 'y': 2.634134054770714, 'z': 0},
	    'situation': "I'm heating my food where there is a fridge on my right",
	    'question': "How many stools are there behind me?",
    })
    # mycol.insert_one({
    #     'hash1': '23d3',
    #         'hash2': '45wy',
    #     'task_db': task_db,
    #     'scene_id': 'scene0001_00',
    #         'sqa_db_collection_name': 'test_stage',
    #         'task_type': '3',
    #     'max_response': 1,
    #     'cur_response': 0,
    #         'agent_rot': {'_x': 0, '_y': 0, '_z': -0.9635581854171914, '_w': 0.26749882862458696},
    #         'agent_pos': {'x': 1.3522363260004358, 'y': 2.634134054770714, 'z': 0},
    #         'situation': "I'm heating my food where there is a fridge on my right",
    #         'question': "How many stools are there behine me?",
    # })



    # res = mycol.find({'hash1': '23d1'})
    res = mycol.find({})
    for x in res:
        print(x)

if __name__ == '__main__':
    main()
