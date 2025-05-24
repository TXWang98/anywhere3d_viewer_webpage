#!/usr/bin/env python
# -*- coding:UTF-8 -*-

import glob
import os.path as osp
import json
import pymongo
import argparse

# obj_scanrefer = json.load(open('/home/robot/datasets/objs_scanrefer.json', 'r')).keys()
# obj_referit3d = json.load(open('/home/robot/datasets/objs_referit3d.json', 'r')).keys()


#For Anywhere3D

#excluded_objs = []


#For SQA3D

# excluded_objs = ['wall',
#  'floor',
#  'object',
#  'doorframe',
#  'ceiling',
#  'shoes',
#  'shower walls',
#  'closet wall',
#  'rail',
#  'person',
#  'ceiling light',
#  'paper',
#  'boxes',
#  'column',
#  'closet rod',
#  'pillar',
#  'shower wall',
#  'shower floor',
#  'curtains',
#  'papers',
#  'pantry wall',
#  'closet walls',
#  'stack of cups',
#  'case of water bottles',
#  'railing',
#  'hand rail',
#  'wood',
#  'sliding wood door',
#  'boards',
#  'boxes of paper',
#  'cat litter box',
#  'pantry walls',
#  'cabinet doors',
#  'glass doors',
#  'shower doors',
#  'bath products',
#  'closet doorframe',
#  'wall mounted coat rack',
#  'closet floor',
#  'plates',
#  'legs']

#For Anywhere3D

excluded_objs = ['wall',
 'floor',
 'object',
 'doorframe',
 'ceiling',
 'shower walls',
 'closet wall',
 'rail',
 'person',
 'ceiling light',
 'paper',
 'column',
 'closet rod',
 'pillar',
 'shower wall',
 'shower floor',
 'papers',
 'pantry wall',
 'closet walls',
 'stack of cups',
 'case of water bottles',
 'railing',
 'hand rail',
 'wood',
 'sliding wood door',
 'boards',
 'boxes of paper',
 'cat litter box',
 'pantry walls',
 'cabinet doors',
 'glass doors',
 'shower doors',
 'bath products',
 'closet doorframe',
 'wall mounted coat rack',
 'closet floor',
 'plates',
 'legs']

def main():
    #parser = argparse.ArgumentParser(description = "Dataset Type")
    #parser.add_argument('--type', type = int, default = 0, help = "For scannet, intput 0, For other datasets, input 1")
    #args = parser.parse_args()

    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient['sqa3d']

    #Scannetcol = mydb['ScanNet_objects_full']
    #Scannetcol.drop()

    scannetcol = mydb['scannet_objects_full']
    scannetcol.drop()

    #null_col = mydb['null']
    #null_col.drop()


    multiscancol = mydb['multiscan_objects_full']
    multiscancol.drop()

    RScancol = mydb['3RScan_objects_full']
    RScancol.drop()

    arkitscene_train_col = mydb['arkitscene_train_objects_full']
    arkitscene_train_col.drop()

    arkitscene_valid_col = mydb['arkitscene_valid_objects_full']
    arkitscene_valid_col.drop()


    annotation_col = mydb['annotation_result_part_level']
    annotation_col.drop()

    




    #fl_scannet = glob.glob('/home/wangtianxu/SQA3D_Viewer/server/static/scannet/objects/*')
    fl_scannet = glob.glob('../server/static/scannet/objects/*')
    train = val = test = 0
    # split = json.load(open('./scene_split.json', 'r'))
    #if args.type == 0:
    for i in fl_scannet:
        sid = i.split('/')[-1] #scene0027_00
        fns = osp.join(i, '*') #/home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00/*
        all_oname = []
        all_oid = []
        #print(i,fns) 
        #i: /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00
        #fns: /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00/*
        for j in glob.glob(fns):
            #print(j) # /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0554_00/13_towel.ply
            fn = j.split('/')[-1] #13_towel.ply
            oid = fn.split('_')[0] #13
            #print(oid)
            oname = ' '.join(fn.split('.')[0].split('_')[1:]) #night stand
            # exlude those do not appeat in scannrefer
            # if '_'.join(oname.split(' ')) not in obj_scanrefer:
            #     continue

            # exclude selected
            if oname in excluded_objs:
                continue

            all_oid.append(oid)
            all_oname.append(oname)

        remove_book = True if "books" in all_oname else False
        for oid, oname in zip(all_oid, all_oname):
            if remove_book and oname == 'book':
                continue
            if oname == 'books':
                continue
            # if sid in split['train']:
            #     train += 1
            # elif sid in split['val']:
            #     val += 1
            # elif sid in split['test']:
            #     test += 1
            # else:
            #     raise NotImplementedError
            scannetcol.insert_one({
                'scene_id': sid,
                'object_id': oid,
                'object_name': oname,
            })



    #fl_multiscan = glob.glob('/home/wangtianxu/SQA3D_Viewer/server/static/multiscan/objects/*')
    fl_multiscan = glob.glob('../server/static/multiscan/objects/*')
    train = val = test = 0
    # split = json.load(open('./scene_split.json', 'r'))
    #if args.type == 0:
    for i in fl_multiscan:
        sid = i.split('/')[-1] #scene0027_00
        fns = osp.join(i, '*') #/home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00/*
        all_oname = []
        all_oid = []
        #print(i,fns) 
        #i: /home/wangtianxu/SQA3D_Viewer/server/static/scanet/ScanNet_objects/scene0027_00
        #fns: /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00/*
        for j in glob.glob(fns):
            #print(j) # /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0554_00/13_towel.ply
            fn = j.split('/')[-1] #13_towel.ply
            oid = fn.split('_')[0] #13
            #print(oid)
            oname = ' '.join(fn.split('.')[0].split('_')[1:]) #night stand
            # exlude those do not appeat in scannrefer
            # if '_'.join(oname.split(' ')) not in obj_scanrefer:
            #     continue

            # exclude selected
            if oname in excluded_objs:
                continue

            all_oid.append(oid)
            all_oname.append(oname)

        remove_book = True if "books" in all_oname else False
        for oid, oname in zip(all_oid, all_oname):
            if remove_book and oname == 'book':
                continue
            if oname == 'books':
                continue
            # if sid in split['train']:
            #     train += 1
            # elif sid in split['val']:
            #     val += 1
            # elif sid in split['test']:
            #     test += 1
            # else:
            #     raise NotImplementedError
            multiscancol.insert_one({
                'scene_id': sid,
                'object_id': oid,
                'object_name': oname,
            })
    

    #fl_3RScan = glob.glob('/home/wangtianxu/SQA3D_Viewer/server/static/3RScan/objects/*')
    fl_3RScan = glob.glob('../server/static/3RScan/objects/*')
    train = val = test = 0
    # split = json.load(open('./scene_split.json', 'r'))
    #if args.type == 0:
    for i in fl_3RScan:
        sid = i.split('/')[-1] #scene0027_00
        fns = osp.join(i, '*') #/home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00/*
        all_oname = []
        all_oid = []
        #print(i,fns) 
        #i: /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00
        #fns: /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00/*
        for j in glob.glob(fns):
            #print(j) # /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0554_00/13_towel.ply
            fn = j.split('/')[-1] #13_towel.ply
            oid = fn.split('_')[0] #13
            #print(oid)
            oname = ' '.join(fn.split('.')[0].split('_')[1:]) #night stand
            # exlude those do not appeat in scannrefer
            # if '_'.join(oname.split(' ')) not in obj_scanrefer:
            #     continue

            # exclude selected
            if oname in excluded_objs:
                continue

            all_oid.append(oid)
            all_oname.append(oname)

        remove_book = True if "books" in all_oname else False
        for oid, oname in zip(all_oid, all_oname):
            if remove_book and oname == 'book':
                continue
            if oname == 'books':
                continue
            # if sid in split['train']:
            #     train += 1
            # elif sid in split['val']:
            #     val += 1
            # elif sid in split['test']:
            #     test += 1
            # else:
            #     raise NotImplementedError
            RScancol.insert_one({
                'scene_id': sid,
                'object_id': oid,
                'object_name': oname,
            })
    

    #fl_arkitscene_train = glob.glob('/home/wangtianxu/SQA3D_Viewer/server/static/arkitscene_train/objects/*')
    fl_arkitscene_train = glob.glob('../server/static/arkitscene_train/objects/*')
    train = val = test = 0
    # split = json.load(open('./scene_split.json', 'r'))
    #if args.type == 0:
    for i in fl_arkitscene_train:
        sid = i.split('/')[-1] #scene0027_00
        fns = osp.join(i, '*') #/home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00/*
        all_oname = []
        all_oid = []
        #print(i,fns) 
        #i: /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00
        #fns: /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00/*
        for j in glob.glob(fns):
            #print(j) # /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0554_00/13_towel.ply
            fn = j.split('/')[-1] #13_towel.ply
            oid = fn.split('_')[0] #13
            #print(oid)
            oname = ' '.join(fn.split('.')[0].split('_')[1:]) #night stand
            # exlude those do not appeat in scannrefer
            # if '_'.join(oname.split(' ')) not in obj_scanrefer:
            #     continue

            # exclude selected
            if oname in excluded_objs:
                continue

            all_oid.append(oid)
            all_oname.append(oname)

        remove_book = True if "books" in all_oname else False
        for oid, oname in zip(all_oid, all_oname):
            if remove_book and oname == 'book':
                continue
            if oname == 'books':
                continue
            # if sid in split['train']:
            #     train += 1
            # elif sid in split['val']:
            #     val += 1
            # elif sid in split['test']:
            #     test += 1
            # else:
            #     raise NotImplementedError
            arkitscene_train_col.insert_one({
                'scene_id': sid,
                'object_id': oid,
                'object_name': oname,
            })

    

    #fl_arkitscene_valid = glob.glob('/home/wangtianxu/SQA3D_Viewer/server/static/arkitscene_valid/objects/*')
    fl_arkitscene_valid = glob.glob('../server/static/arkitscene_valid/objects/*')
    train = val = test = 0
    # split = json.load(open('./scene_split.json', 'r'))
    #if args.type == 0:
    for i in fl_arkitscene_valid:
        sid = i.split('/')[-1] #scene0027_00
        fns = osp.join(i, '*') #/home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00/*
        all_oname = []
        all_oid = []
        #print(i,fns) 
        #i: /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00
        #fns: /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00/*
        for j in glob.glob(fns):
            #print(j) # /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0554_00/13_towel.ply
            fn = j.split('/')[-1] #13_towel.ply
            oid = fn.split('_')[0] #13
            #print(oid)
            oname = ' '.join(fn.split('.')[0].split('_')[1:]) #night stand
            # exlude those do not appeat in scannrefer
            # if '_'.join(oname.split(' ')) not in obj_scanrefer:
            #     continue

            # exclude selected
            if oname in excluded_objs:
                continue

            all_oid.append(oid)
            all_oname.append(oname)

        remove_book = True if "books" in all_oname else False
        for oid, oname in zip(all_oid, all_oname):
            if remove_book and oname == 'book':
                continue
            if oname == 'books':
                continue
            # if sid in split['train']:
            #     train += 1
            # elif sid in split['val']:
            #     val += 1
            # elif sid in split['test']:
            #     test += 1
            # else:
            #     raise NotImplementedError
            arkitscene_valid_col.insert_one({
                'scene_id': sid,
                'object_id': oid,
                'object_name': oname,
            })
    







    '''
    elif args.type == 1:
        for i in fl:
            sid = i.split('/')[-1] #scene0027_00
            fns = osp.join(i, '*') #/home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00/*
            all_oname = []
            all_oid = []
            #print(i,fns) 
            #i: /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00
            #fns: /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0027_00/*
            for j in glob.glob(fns):
                #print(j) # /home/wangtianxu/SQA3D_Viewer/server/static/scannet/ScanNet_objects/scene0554_00/13_towel.ply
                fn = j.split('/')[-1] #13_towel.ply
                oid = fn.split('_')[0] #13
                oname = ' '.join(fn.split('.')[0].split('_')[1:]) #night stand
                # exlude those do not appeat in scannrefer
                # if '_'.join(oname.split(' ')) not in obj_scanrefer:
                #     continue

                # exclude selected
                if oname in excluded_objs:
                    continue

                all_oid.append(oid)
                all_oname.append(oname)

            remove_book = True if "books" in all_oname else False
            for oid, oname in zip(all_oid, all_oname):
                if remove_book and oname == 'book':
                    continue
                if oname == 'books':
                    continue
                # if sid in split['train']:
                #     train += 1
                # elif sid in split['val']:
                #     val += 1
                # elif sid in split['test']:
                #     test += 1
                # else:
                #     raise NotImplementedError
                mycol.insert_one({
                    'scene_id': sid,
                    'object_id': oid,
                    'object_name': oname,
                })
        
    # print(train, val, test)
    # res = mycol.find({'scene_id': 'scene0697_00'})
    # for x in res:
    #     print(x)
    '''

if __name__ == '__main__':
    main()
