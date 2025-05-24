import glob
import os.path as osp
import json
import pymongo
import argparse
import pandas as pd
import Levenshtein
import spacy

csv_file_path = '/home/wangtianxu/Viewer/anywhere3d_scannet_20scene_wtx_12_23_modified.csv'
file = pd.read_csv(csv_file_path, index_col = 0, header = 0)
print(file)


myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient['sqa3d']
collections = mydb.list_collection_names()
collection = mydb['annotation_result_object_level']

for index, row in file.iterrows():
    data_insert = {
        "new_referring_expressions": row['new_referring_expressions'],
        "datasetname": row['datasetname'],
        "scene_id": row['scene_id'],
        "cur_referring_expressions_cnt": "0" + str(row['cur_referring_expressions_cnt']),
        "original_referring_expressions": row['original_referring_expressions'],
        "bounding_box_width": row['box_width'],
        "bounding_box_length": row['box_length'],
        "bounding_box_height": row['box_height'],
        "bounding_box_xpos": row['box_x'],
        "bounding_box_ypos": row['box_y'],
        "bounding_box_zpos": row['box_z'],
        "bounding_box_rotation_angle": row['box_rot_angle'],
        "scale_cylinder_xpos": row['cylinder_x'],
        "scale_cylinder_ypos": row['cylinder_y'],
        "scale_cylinder_zpos": row['cylinder_z'],
        "scale_cylinder_height": row['cylinder_length'],
        "scale_cylinder_diameter": row['cylinder_diameter'],
        "scale_cylinder_rotation_angle": row['cylinder_rot_angle'],
        "window_camera_position":{'x': row['window_camera_position_x'], 'y': row['window_camera_position_y'], 'z': row['window_camera_position_z']},
        "window_camera_quaternion":{'_x': row['window_camera_quaternion_x'], '_y': row['window_camera_quaternion_y'], '_z': row['window_camera_quaternion_z'], '_w': row['window_camera_quaternion_w']},
        "window_camera_target":{'x': row['window_camera_target_x'], 'y': row['window_camera_target_y'], 'z': row['window_camera_target_z']}
    }
    result_insert = collection.insert_one(data_insert)
    print(f"Inserted document ID: {result_insert.inserted_id}")
