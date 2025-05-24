#!/usr/bin/env python
# -*- coding:UTF-8 -*-

import argparse
import glob
import json
import pymongo
from bson.objectid import ObjectId


def main(args):
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient['sqa3d']
    mycol = mydb[args.name]

    total_scene = 707

    if args.hash2_file:
        f = open(args.hash2_file, 'r')
        hash2 = f.read().split('\n')
        if hash2[-1] == '':
            hash2 = hash2[:-1]
        print('Hash2 loaded, total:', len(hash2))
        print('This will clear/remove: {}'.format(args.name))
        print('Continue?')
        s = input('(Y/N): ')
        if s == 'Y' or s == 'y':
            if args.clear_task:
                for h in hash2:
                    q = {'hash2': h}
                    newval = {"$set": { "cur_response": 0 }}
                    mycol.update_one(q, newval)
            elif args.remove_data:
                for h in hash2:
                    q = {'hash2': h}
                    mycol.delete_many(q)
                    # print('\"{}\",'.format(mycol.find(q)[0]['scene_id']))
            print('Done.')
        else:
            print('Aborted.')
    else:
        if args.summary_by_scene:
            for i in range(total_scene):
                count = len(list(mycol.find({'scene_id': 'scene{:04d}_00'.format(i)})))
                if count > 0:
                    print('scene{:04d}_00'.format(i), count)
        else:
            res = mycol.find({})

        if args.drop:
            print('This will drop collection with name: {}'.format(args.name))
            print('Continue?')
            s = input('(Y/N): ')
            if s == 'Y' or s == 'y':
                mycol.drop()
                print('Dropped.')
            else:
                print('Aborted.')
        else:
            for x in res:
                print(x)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='check db.')
    parser.add_argument('--drop', action='store_true', help='drop the collection')
    parser.add_argument('--name', type=str, help='name of collection')
    parser.add_argument('--scene_id', type=str, help='scene id')
    parser.add_argument('--summary-by-scene', action='store_true')
    parser.add_argument('--hash2_file', type=str, help='hash2 list')
    parser.add_argument('--clear-task', action='store_true')
    parser.add_argument('--remove-data', action='store_true')
    args = parser.parse_args()
    main(args)
