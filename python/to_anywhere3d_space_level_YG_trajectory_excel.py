import glob
import os.path as osp
import json
import pymongo
import argparse
import pandas as pd
import Levenshtein
import spacy


def main():
    
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient['sqa3d']
    collections = mydb.list_collection_names()
    #print(collections)
    #print("scannet_objects_full:", mydb['scannet_objects_full'])
    collection = mydb['annotation_result']
    #print(documents)
    #print(mydb)
    documents = collection.find()


    dataset_scene_id_cnt_dic = {}
    anywhere3d_annotation_lis = []
    for document in documents:
        dataset_scene_id_cnt_str = document['datasetname'] + "_" + document['scene_id'] + "_" + document['cur_referring_expressions_cnt'] 
        if (document['cur_referring_expressions_cnt'] == '08' or document['cur_referring_expressions_cnt'] == '09') and 'object' not in document['new_referring_expressions']:
            if dataset_scene_id_cnt_str in dataset_scene_id_cnt_dic:
                if document["_id"] > dataset_scene_id_cnt_dic[dataset_scene_id_cnt_str]:
                    for i, ele in enumerate(anywhere3d_annotation_lis):
                        if ele["_id"] == dataset_scene_id_cnt_dic[dataset_scene_id_cnt_str]:
                            anywhere3d_annotation_lis[i] = {
                                            "_id": document["_id"],
                                            "datasetname": document["datasetname"],
                                            "scene_id": document["scene_id"],
                                            "cur_referring_expressions_cnt": document["cur_referring_expressions_cnt"],
                                            "original_referring_expressions": document["original_referring_expressions"],
                                            "new_referring_expressions": document["new_referring_expressions"],
                                            "box_width": document["bounding_box_width"], #len_x
                                            "box_length": document["bounding_box_length"], #len_y
                                            "box_height": document["bounding_box_height"], #len_z
                                            "box_x": document["bounding_box_xpos"],
                                            "box_y": document["bounding_box_ypos"],
                                            "box_z": document["bounding_box_zpos"],
                                            "box_rot_angle": document["bounding_box_rotation_angle"],
                                            "cylinder_diameter": document["scale_cylinder_diameter"],
                                            "cylinder_length": document["scale_cylinder_height"],
                                            "cylinder_x": document["scale_cylinder_xpos"],
                                            "cylinder_y": document["scale_cylinder_ypos"],
                                            "cylinder_z": document["scale_cylinder_zpos"],
                                            "cylinder_rot_angle": document["scale_cylinder_rotation_angle"],
                                            "window_camera_position_x": document["window_camera_position"]["x"],
                                            "window_camera_position_y": document["window_camera_position"]["y"],
                                            "window_camera_position_z": document["window_camera_position"]["z"],
                                            "window_camera_quaternion_x": document["window_camera_quaternion"]["_x"],
                                            "window_camera_quaternion_y": document["window_camera_quaternion"]["_y"],
                                            "window_camera_quaternion_z": document["window_camera_quaternion"]["_z"],
                                            "window_camera_quaternion_w": document["window_camera_quaternion"]["_w"],
                                            "window_camera_target_x": document["window_camera_target"]["x"],
                                            "window_camera_target_y": document["window_camera_target"]["y"],
                                            "window_camera_target_z": document["window_camera_target"]["z"]
                                        }
                    dataset_scene_id_cnt_dic[dataset_scene_id_cnt_str] = document["_id"]

            else:
                dataset_scene_id_cnt_dic[dataset_scene_id_cnt_str] = document["_id"]
                anywhere3d_annotation_lis.append({
                    "_id": document["_id"],
                    "datasetname": document["datasetname"],
                    "scene_id": document["scene_id"],
                    "cur_referring_expressions_cnt": document["cur_referring_expressions_cnt"],
                    "original_referring_expressions": document["original_referring_expressions"],
                    "new_referring_expressions": document["new_referring_expressions"],
                    "box_width": document["bounding_box_width"], #len_x
                    "box_length": document["bounding_box_length"], #len_y
                    "box_height": document["bounding_box_height"], #len_z
                    "box_x": document["bounding_box_xpos"],
                    "box_y": document["bounding_box_ypos"],
                    "box_z": document["bounding_box_zpos"],
                    "box_rot_angle": document["bounding_box_rotation_angle"],
                    "cylinder_diameter": document["scale_cylinder_diameter"],
                    "cylinder_length": document["scale_cylinder_height"],
                    "cylinder_x": document["scale_cylinder_xpos"],
                    "cylinder_y": document["scale_cylinder_ypos"],
                    "cylinder_z": document["scale_cylinder_zpos"],
                    "cylinder_rot_angle": document["scale_cylinder_rotation_angle"],
                    "window_camera_position_x": document["window_camera_position"]["x"],
                    "window_camera_position_y": document["window_camera_position"]["y"],
                    "window_camera_position_z": document["window_camera_position"]["z"],
                    "window_camera_quaternion_x": document["window_camera_quaternion"]["_x"],
                    "window_camera_quaternion_y": document["window_camera_quaternion"]["_y"],
                    "window_camera_quaternion_z": document["window_camera_quaternion"]["_z"],
                    "window_camera_quaternion_w": document["window_camera_quaternion"]["_w"],
                    "window_camera_target_x": document["window_camera_target"]["x"],
                    "window_camera_target_y": document["window_camera_target"]["y"],
                    "window_camera_target_z": document["window_camera_target"]["z"]
                })
        elif document['new_referring_expressions'] != "Skip.":
            if dataset_scene_id_cnt_str in dataset_scene_id_cnt_dic:
                if document["_id"] > dataset_scene_id_cnt_dic[dataset_scene_id_cnt_str]:
                    for i, ele in enumerate(anywhere3d_annotation_lis):
                        if ele["_id"] == dataset_scene_id_cnt_dic[dataset_scene_id_cnt_str]:
                            anywhere3d_annotation_lis[i] = {
                                            "_id": document["_id"],
                                            "datasetname": document["datasetname"],
                                            "scene_id": document["scene_id"],
                                            "cur_referring_expressions_cnt": document["cur_referring_expressions_cnt"],
                                            "original_referring_expressions": document["original_referring_expressions"],
                                            "new_referring_expressions": document["new_referring_expressions"],
                                            "box_width": document["bounding_box_width"], #len_x
                                            "box_length": document["bounding_box_length"], #len_y
                                            "box_height": document["bounding_box_height"], #len_z
                                            "box_x": document["bounding_box_xpos"],
                                            "box_y": document["bounding_box_ypos"],
                                            "box_z": document["bounding_box_zpos"],
                                            "box_rot_angle": document["bounding_box_rotation_angle"],
                                            "cylinder_diameter": document["scale_cylinder_diameter"],
                                            "cylinder_length": document["scale_cylinder_height"],
                                            "cylinder_x": document["scale_cylinder_xpos"],
                                            "cylinder_y": document["scale_cylinder_ypos"],
                                            "cylinder_z": document["scale_cylinder_zpos"],
                                            "cylinder_rot_angle": document["scale_cylinder_rotation_angle"],
                                            "window_camera_position_x": document["window_camera_position"]["x"],
                                            "window_camera_position_y": document["window_camera_position"]["y"],
                                            "window_camera_position_z": document["window_camera_position"]["z"],
                                            "window_camera_quaternion_x": document["window_camera_quaternion"]["_x"],
                                            "window_camera_quaternion_y": document["window_camera_quaternion"]["_y"],
                                            "window_camera_quaternion_z": document["window_camera_quaternion"]["_z"],
                                            "window_camera_quaternion_w": document["window_camera_quaternion"]["_w"],
                                            "window_camera_target_x": document["window_camera_target"]["x"],
                                            "window_camera_target_y": document["window_camera_target"]["y"],
                                            "window_camera_target_z": document["window_camera_target"]["z"]
                                        }
                    dataset_scene_id_cnt_dic[dataset_scene_id_cnt_str] = document["_id"]

            else:
                dataset_scene_id_cnt_dic[dataset_scene_id_cnt_str] = document["_id"]
                anywhere3d_annotation_lis.append({
                    "_id": document["_id"],
                    "datasetname": document["datasetname"],
                    "scene_id": document["scene_id"],
                    "cur_referring_expressions_cnt": document["cur_referring_expressions_cnt"],
                    "original_referring_expressions": document["original_referring_expressions"],
                    "new_referring_expressions": document["new_referring_expressions"],
                    "box_width": document["bounding_box_width"], #len_x
                    "box_length": document["bounding_box_length"], #len_y
                    "box_height": document["bounding_box_height"], #len_z
                    "box_x": document["bounding_box_xpos"],
                    "box_y": document["bounding_box_ypos"],
                    "box_z": document["bounding_box_zpos"],
                    "box_rot_angle": document["bounding_box_rotation_angle"],
                    "cylinder_diameter": document["scale_cylinder_diameter"],
                    "cylinder_length": document["scale_cylinder_height"],
                    "cylinder_x": document["scale_cylinder_xpos"],
                    "cylinder_y": document["scale_cylinder_ypos"],
                    "cylinder_z": document["scale_cylinder_zpos"],
                    "cylinder_rot_angle": document["scale_cylinder_rotation_angle"],
                    "window_camera_position_x": document["window_camera_position"]["x"],
                    "window_camera_position_y": document["window_camera_position"]["y"],
                    "window_camera_position_z": document["window_camera_position"]["z"],
                    "window_camera_quaternion_x": document["window_camera_quaternion"]["_x"],
                    "window_camera_quaternion_y": document["window_camera_quaternion"]["_y"],
                    "window_camera_quaternion_z": document["window_camera_quaternion"]["_z"],
                    "window_camera_quaternion_w": document["window_camera_quaternion"]["_w"],
                    "window_camera_target_x": document["window_camera_target"]["x"],
                    "window_camera_target_y": document["window_camera_target"]["y"],
                    "window_camera_target_z": document["window_camera_target"]["z"]
                })

    print(len(anywhere3d_annotation_lis))

    # edit_cnt = [0, 0, 0, 0, 0]
    # word_cnt = [0, 0, 0, 0, 0]
    # exp_cnt = [0, 0, 0, 0, 0] 
    # semantic_similarity = [0, 0, 0, 0, 0]
    
    # nlp = spacy.load('en_core_web_lg')

    # for i, annotation in enumerate(anywhere3d_annotation_lis):
    #     num = Levenshtein.distance(annotation['original_referring_expressions'], annotation['new_referring_expressions'])
    #     edit_cnt[int(annotation['cur_referring_expressions_cnt'][1])] += num    
    #     word_cnt[int(annotation['cur_referring_expressions_cnt'][1])] += len(annotation['original_referring_expressions'])
    #     #word_cnt[int(annotation['cur_referring_expressions_cnt'][1])] += min(len(annotation['original_referring_expressions']), len(annotation['new_referring_expressions']))
    #     exp_cnt[int(annotation['cur_referring_expressions_cnt'])] += 1
    #     semantic_similarity[int(annotation['cur_referring_expressions_cnt'])] += nlp(annotation['original_referring_expressions']).similarity(nlp(annotation['new_referring_expressions']))
    
    # print("editing number:", edit_cnt)
    # print("total word number", word_cnt)
    # print("expression number", exp_cnt)
    # for i in range(len(semantic_similarity)):
    #     semantic_similarity[i] = semantic_similarity[i] / exp_cnt[i]
    # print(semantic_similarity)

    #[155, 224, 123, 384, 496]
    #[703, 690, 1081, 811, 754]
    #[0.22, 0.32, 0.113, 0.47, 0.66]

    #similarity: [0.948, 0.969, 0.940, 0.840, 0.62]

    #df = pd.DataFrame(anywhere3d_annotation_lis)
    #df.to_excel('/home/wangtianxu/Viewer/anywhere3d_space_level_YG_and_trajectory_2_8.xlsx', header = True, index = True)

            
    
    # df = pd.DataFrame(anywhere3d_annotation_lis)
    # df.to_csv('/home/wangtianxu/Viewer/anywhere3d_scannet_20scene_wtx_12_20_morning.csv', sep = ',', encoding = 'utf-8-sig', header = True, index = True)


    
    #collection = mydb['multiscan']


if __name__ == '__main__':
    main()

