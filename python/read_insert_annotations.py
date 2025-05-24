import glob
import os.path as osp
import json
import pymongo
import argparse
import pandas as pd
import Levenshtein
import spacy

csv_file_path = '/home/wangtianxu/Viewer/anywhere3d_scannet_20scene_wtx_12_20_morning.csv'
file = pd.read_csv(csv_file_path, index_col = 0, header = 0)
print(file)

dataset_name = ['ScanNet', 'MultiScan', '3RScan', 'ARKitScenes_validation']
dataset_scene_lis = [
                        ['scene0663_00', 'scene0139_00', 'scene0406_00', 'scene0414_00', 'scene0593_00'],
                        ['scene0112_00', 'scene0109_00', 'scene0108_00', 'scene0106_00', 'scene0111_00'],
                        ['scene0275_00', 'scene0300_00', 'scene1033_00', 'scene0741_00', 'scene0002_00'],
                        ['scene0168_00', 'scene0190_00', 'scene0304_00', 'scene0344_00', 'scene0256_00']
                    ]
    #For 3RScan
    # [-0.12276506423950195, -0.27524006366729736, -1.1459999680519104]
    # [1.105745017528534 0.5891700387001038 -0.20396500825881958] 
    # [-1.7288649678230286, -2.457830011844635, 0.2753649950027466]
    # [0.24969005584716797, -0.7613049745559692, -0.2676849961280823]
    # [-0.048600077629089355, 0.2797900438308716, -0.984529972076416]
    
    
    #For ARKitScene_Validtion
    #[-1.4214901328086853, 1.7421624660491943, 0.8220704793930054]
    #[-0.275934100151062, 2.3402678966522217, 0.2874600291252136]
    #[-0.35904574394226074, -0.010807275772094727, 0.7275000512599945]
    #[3.116059422492981, -1.0805418491363525, -0.269059956073761]
    #[3.106052875518799, -0.4373711347579956, 0.002910017967224121]

for index, row in file.iterrows():
    # print(file.loc[index, 'box_x'])

    if row['datasetname'] == '3RScan' and row['scene_id'] == 'scene0275_00':
        file.loc[index, 'box_x'] += round(-0.12276506423950195, 2)
        file.loc[index, 'box_y'] += round(-0.27524006366729736, 2)
        file.loc[index, 'cylinder_x'] += round(-0.12276506423950195, 2)
        file.loc[index, 'cylinder_y'] += round(-0.27524006366729736, 2)
        file.loc[index, 'window_camera_position_x'] += round(-0.12276506423950195, 2)
        file.loc[index, 'window_camera_position_y'] += round(-0.27524006366729736, 2)
        file.loc[index, 'window_camera_target_x'] += round(-0.12276506423950195, 2)
        file.loc[index, 'window_camera_target_y'] += round(-0.27524006366729736, 2)
    elif row['datasetname'] == '3RScan' and row['scene_id'] == 'scene0300_00':
        file.loc[index, 'box_x'] += round(1.105745017528534, 2)
        file.loc[index, 'box_y'] += round(0.5891700387001038, 2)
        file.loc[index, 'cylinder_x'] += round(1.105745017528534, 2)
        file.loc[index, 'cylinder_y'] += round(0.5891700387001038, 2)
        file.loc[index, 'window_camera_position_x'] += round(1.105745017528534, 2)
        file.loc[index, 'window_camera_position_y'] += round(0.5891700387001038, 2)
        file.loc[index, 'window_camera_target_x'] += round(1.105745017528534, 2)
        file.loc[index, 'window_camera_target_y'] += round(0.5891700387001038, 2)
    elif row['datasetname'] == '3RScan' and row['scene_id'] == 'scene1033_00':
        file.loc[index, 'box_x'] += round(-1.7288649678230286, 2)
        file.loc[index, 'box_y'] += round(-2.457830011844635, 2)
        file.loc[index, 'cylinder_x'] += round(-1.7288649678230286, 2)
        file.loc[index, 'cylinder_y'] += round(-2.457830011844635, 2)
        file.loc[index, 'window_camera_position_x'] += round(-1.7288649678230286, 2)
        file.loc[index, 'window_camera_position_y'] += round(-2.457830011844635, 2)
        file.loc[index, 'window_camera_target_x'] += round(-1.7288649678230286, 2)
        file.loc[index, 'window_camera_target_y'] += round(-2.457830011844635, 2)
    elif row['datasetname'] == '3RScan' and row['scene_id'] == 'scene0741_00':
        file.loc[index, 'box_x'] += round(0.24969005584716797 ,2)
        file.loc[index, 'box_y'] += round(-0.7613049745559692, 2)
        file.loc[index, 'cylinder_x'] += round(0.24969005584716797 ,2)
        file.loc[index, 'cylinder_y'] += round(-0.7613049745559692, 2)
        file.loc[index, 'window_camera_position_x'] += round(0.24969005584716797 ,2)
        file.loc[index, 'window_camera_position_y'] += round(-0.7613049745559692, 2)
        file.loc[index, 'window_camera_target_x'] += round(0.24969005584716797 ,2)
        file.loc[index, 'window_camera_target_y'] += round(-0.7613049745559692, 2)
    elif row['datasetname'] == '3RScan' and row['scene_id'] == 'scene0002_00':
        file.loc[index, 'box_x'] += round(-0.048600077629089355, 2)
        file.loc[index, 'box_y'] += round(0.2797900438308716, 2)
        file.loc[index, 'cylinder_x'] += round(-0.048600077629089355, 2)
        file.loc[index, 'cylinder_y'] += round(0.2797900438308716, 2)
        file.loc[index, 'window_camera_position_x'] += round(-0.048600077629089355, 2)
        file.loc[index, 'window_camera_position_y'] += round(0.2797900438308716, 2)
        file.loc[index, 'window_camera_target_x'] += round(-0.048600077629089355, 2)
        file.loc[index, 'window_camera_target_y'] += round(0.2797900438308716, 2)
    elif row['datasetname'] == 'arkitscene_valid' and row['scene_id'] == 'scene0168_00':
        file.loc[index, 'box_x'] += round(-1.4214901328086853, 2)
        file.loc[index, 'box_y'] += round(1.7421624660491943, 2)
        file.loc[index, 'cylinder_x'] += round(-1.4214901328086853, 2)
        file.loc[index, 'cylinder_y'] += round(1.7421624660491943, 2)
        file.loc[index, 'window_camera_position_x'] += round(-1.4214901328086853, 2)
        file.loc[index, 'window_camera_position_y'] += round(1.7421624660491943, 2)
        file.loc[index, 'window_camera_target_x'] += round(-1.4214901328086853, 2)
        file.loc[index, 'window_camera_target_y'] += round(1.7421624660491943, 2)
    elif row['datasetname'] == 'arkitscene_valid' and row['scene_id'] == 'scene0190_00':
        file.loc[index, 'box_x'] += round(-0.275934100151062, 2)
        file.loc[index, 'box_y'] += round(2.3402678966522217, 2)
        file.loc[index, 'cylinder_x'] += round(-0.275934100151062, 2)
        file.loc[index, 'cylinder_y'] += round(2.3402678966522217, 2)
        file.loc[index, 'window_camera_position_x'] += round(-0.275934100151062, 2)
        file.loc[index, 'window_camera_position_y'] += round(2.3402678966522217, 2)
        file.loc[index, 'window_camera_target_x'] += round(-0.275934100151062, 2)
        file.loc[index, 'window_camera_target_y'] += round(2.3402678966522217, 2)
    elif row['datasetname'] == 'arkitscene_valid' and row['scene_id'] == 'scene0304_00':
        file.loc[index, 'box_x'] += round(-0.35904574394226074, 2)
        file.loc[index, 'box_y'] += round(-0.010807275772094727, 2)
        file.loc[index, 'cylinder_x'] += round(-0.35904574394226074, 2)
        file.loc[index, 'cylinder_y'] += round(-0.010807275772094727, 2)
        file.loc[index, 'window_camera_position_x'] += round(-0.35904574394226074, 2)
        file.loc[index, 'window_camera_position_y'] += round(-0.010807275772094727, 2)
        file.loc[index, 'window_camera_target_x'] += round(-0.35904574394226074, 2)
        file.loc[index, 'window_camera_target_y'] += round(-0.010807275772094727, 2)
    elif row['datasetname'] == 'arkitscene_valid' and row['scene_id'] == 'scene0344_00':
        file.loc[index, 'box_x'] += round(3.116059422492981, 2)
        file.loc[index, 'box_y'] += round(-1.0805418491363525, 2)
        file.loc[index, 'cylinder_x'] += round(3.116059422492981, 2)
        file.loc[index, 'cylinder_y'] += round(-1.0805418491363525, 2)
        file.loc[index, 'window_camera_position_x'] += round(3.116059422492981, 2)
        file.loc[index, 'window_camera_position_y'] += round(-1.0805418491363525, 2)
        file.loc[index, 'window_camera_target_x'] += round(3.116059422492981, 2)
        file.loc[index, 'window_camera_target_y'] += round(-1.0805418491363525, 2)
    elif row['datasetname'] == 'arkitscene_valid' and row['scene_id'] == 'scene0256_00':
        file.loc[index, 'box_x'] += round(3.106052875518799, 2)
        file.loc[index, 'box_y'] += round(-0.4373711347579956, 2)
        file.loc[index, 'cylinder_x'] += round(3.106052875518799, 2)
        file.loc[index, 'cylinder_y'] += round(-0.4373711347579956, 2)
        file.loc[index, 'window_camera_position_x'] += round(3.106052875518799, 2)
        file.loc[index, 'window_camera_position_y'] += round(-0.4373711347579956, 2)
        file.loc[index, 'window_camera_target_x'] += round(3.106052875518799, 2)
        file.loc[index, 'window_camera_target_y'] += round(-0.4373711347579956, 2)


file.to_excel('/home/wangtianxu/Viewer/anywhere3d_20scene_wtx_01_02_modified.xlsx', header = True, index = True)

# myclient = pymongo.MongoClient("mongodb://localhost:27017/")
# mydb = myclient['sqa3d']
# collections = mydb.list_collection_names()
# collection = mydb['annotation_result']

# for index, row in file.iterrows():
#     data_insert = {
#         "new_referring_expressions": row['new_referring_expressions'],
#         "datasetname": row['datasetname'],
#         "scene_id": row['scene_id'],
#         "cur_referring_expressions_cnt": "0" + str(row['cur_referring_expressions_cnt']),
#         "original_referring_expressions": row['original_referring_expressions'],
#         "bounding_box_width": row['box_width'],
#         "bounding_box_length": row['box_length'],
#         "bounding_box_height": row['box_height'],
#         "bounding_box_xpos": row['box_x'],
#         "bounding_box_ypos": row['box_y'],
#         "bounding_box_zpos": row['box_z'],
#         "bounding_box_rotation_angle": row['box_rot_angle'],
#         "scale_cylinder_xpos": row['cylinder_x'],
#         "scale_cylinder_ypos": row['cylinder_y'],
#         "scale_cylinder_zpos": row['cylinder_z'],
#         "scale_cylinder_height": row['cylinder_length'],
#         "scale_cylinder_diameter": row['cylinder_diameter'],
#         "scale_cylinder_rotation_angle": row['cylinder_rot_angle'],
#         "window_camera_position":{'x': row['window_camera_position_x'], 'y': row['window_camera_position_y'], 'z': row['window_camera_position_z']},
#         "window_camera_quaternion":{'_x': row['window_camera_quaternion_x'], '_y': row['window_camera_quaternion_y'], '_z': row['window_camera_quaternion_z'], '_w': row['window_camera_quaternion_w']},
#         "window_camera_target":{'x': row['window_camera_target_x'], 'y': row['window_camera_target_y'], 'z': row['window_camera_target_z']}
#     }
#     result_insert = collection.insert_one(data_insert)
#     print(f"Inserted document ID: {result_insert.inserted_id}")
