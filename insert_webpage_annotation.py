#!/usr/bin/env python
# -*- coding:UTF-8 -*-

import glob
import os.path as osp
import json
import pymongo
import argparse
import certifi
import os

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

excluded_objs = []

# excluded_objs = ['wall',
#  'floor',
#  'object',
#  'doorframe',
#  'ceiling',
#  'shower walls',
#  'closet wall',
#  'rail',
#  'person',
#  'ceiling light',
#  'paper',
#  'column',
#  'closet rod',
#  'pillar',
#  'shower wall',
#  'shower floor',
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

def main():
    #parser = argparse.ArgumentParser(description = "Dataset Type")
    #parser.add_argument('--type', type = int, default = 0, help = "For scannet, intput 0, For other datasets, input 1")
    #args = parser.parse_args()

    DB_url = "mongodb+srv://wtx19980928:HPMCao1PK9jvC3W9@cluster0.gw0qzb9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    # DB_url_local = "mongodb://localhost:27017/"

    myclient = pymongo.MongoClient(DB_url, tlsCAFile=certifi.where())
    mydb = myclient['sqa3d']

    # Scannetcol = mydb['ScanNet_objects_full']
    # Scannetcol.drop()

    # scannetcol = mydb['scannet_objects_full']
    # scannetcol.drop()


    # multiscancol = mydb['multiscan_objects_full']
    # multiscancol.drop()

    # RScancol = mydb['3RScan_objects_full']
    # RScancol.drop()

    # arkitscene_train_col = mydb['arkitscene_train_objects_full']
    # arkitscene_train_col.drop()

    # arkitscene_valid_col = mydb['arkitscene_valid_objects_full']
    # arkitscene_valid_col.drop()



    annotation_col = mydb['annotation_result']
    annotation_col.drop()

    webpage_annotation_json_path = "./webpage_annotation.json"
    with open(webpage_annotation_json_path, "r") as f:
        webpage_annotation_json = json.load(f)
    
    for annotation_cnt_num, sample in enumerate(webpage_annotation_json):
        print(annotation_cnt_num)
        if sample["datasetname"] == "scannet":
            bias_x = 0
            bias_y = 0
            bias_z = 0
        elif sample["datasetname"] == "multiscan":
            bias_x = -0.33
            bias_y = 0.64
            bias_z = -1.18
        elif sample["datasetname"] == "3RScan":
            bias_x = -0.33
            bias_y = 0.15
            bias_z = -3.14    
        elif sample["datasetname"] == "arkitscene_valid":
            bias_x = 1.9
            bias_y = 0.75
            bias_z = -1.75    

        data_insert = {
            "new_referring_expressions": sample['referring_expressions'],
            "datasetname": sample['datasetname'],
            "scene_id": sample['scene_id'],
            "cur_referring_expressions_cnt": "0" + str(sample['expressions_cnt_in_annotation_interface']),
            "original_referring_expressions": sample['referring_expressions'],
            "bounding_box_width": sample['box_width'],
            "bounding_box_length": sample['box_length'],
            "bounding_box_height": sample['box_height'],
            "bounding_box_xpos": sample['box_x'] + bias_x,
            "bounding_box_ypos": sample['box_y'] + bias_y,
            "bounding_box_zpos": sample['box_z'] + bias_z,
            "bounding_box_rotation_angle": sample['box_rot_angle'],
            "scale_cylinder_xpos": sample['cylinder_x'],
            "scale_cylinder_ypos": sample['cylinder_y'],
            "scale_cylinder_zpos": sample['cylinder_z'],
            "scale_cylinder_height": sample['cylinder_length'],
            "scale_cylinder_diameter": sample['cylinder_diameter'],
            "scale_cylinder_rotation_angle": sample['cylinder_rot_angle'],
            "window_camera_position":{'x': sample['window_camera_position_x'], 'y': sample['window_camera_position_y'], 'z': sample['window_camera_position_z']},
            "window_camera_quaternion":{'_x': sample['window_camera_quaternion_x'], '_y': sample['window_camera_quaternion_y'], '_z': sample['window_camera_quaternion_z'], '_w': sample['window_camera_quaternion_w']},
            "window_camera_target":{'x': sample['window_camera_target_x'], 'y': sample['window_camera_target_y'], 'z': sample['window_camera_target_z']}
        }
        
        result_insert = annotation_col.insert_one(data_insert)
        print(f"Inserted document ID: {result_insert.inserted_id}")
    

    

    '''




    #fl_scannet = glob.glob('/home/wangtianxu/SQA3D_Viewer/server/static/scannet/objects/*')
    fl_scannet = glob.glob('./server/static/scannet/objects/*')
    print(len(fl_scannet))
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
            scannetcol.insert_one({
                'scene_id': sid,
                'object_id': oid,
                'object_name': oname,
            })
            print("insert one")



    #fl_multiscan = glob.glob('/home/wangtianxu/SQA3D_Viewer/server/static/multiscan/objects/*')
    fl_multiscan = glob.glob('./server/static/multiscan/objects/*')
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
            multiscancol.insert_one({
                'scene_id': sid,
                'object_id': oid,
                'object_name': oname,
            })
    

    #fl_3RScan = glob.glob('/home/wangtianxu/SQA3D_Viewer/server/static/3RScan/objects/*')
    fl_3RScan = glob.glob('./server/static/3RScan/objects/*')
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
            RScancol.insert_one({
                'scene_id': sid,
                'object_id': oid,
                'object_name': oname,
            })
    

   


    #fl_arkitscene_valid = glob.glob('/home/wangtianxu/SQA3D_Viewer/server/static/arkitscene_valid/objects/*')
    fl_arkitscene_valid = glob.glob('./server/static/arkitscene_valid/objects/*')
    train = val = test = 0
    # split = json.load(open('./scene_split.json', 'r'))
    #if args.type == 0:
    print(len(fl_arkitscene_valid))
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
            arkitscene_valid_col.insert_one({
                'scene_id': sid,
                'object_id': oid,
                'object_name': oname,
            })
    
    '''


    
    print("All data inserted successfully.")
    myclient.close()
    
    


if __name__ == '__main__':
    main()
    # print("All data inserted successfully.")