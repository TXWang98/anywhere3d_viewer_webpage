In MeshViewer_save.js, save the original MeshViewer.js implemented by XiaoJian, which neither adds
bounding box nor adds scaling cylinder. The control bar is not included as well.

In MeshViewer_save2,js, we implement MeshViewer Version before 2024.10.10, corresponds to the version of Meeting Notes 10.9 in AnyWhere3D. In this version, the ToDo mentioned in 10.9 Meeting notes have not been implemented yet.

In MeshViewer_save3.js, we implement moving the bounding box by both mouse and control bar. After 
end dragging by mouse, the control bar will be cleared to 0.


In MeshViewer_save4.js, we save the implementation by 10.17. We already add object sizes on the interface in
'List of objects'.


In MeshViewer_save5.js, we save the implementation by 10.18. We implement control bar; Display Scene & Object;
show object list and their sizes

In MeshViewer_save6.js, we save the implementation by 10.22. We aim to save bounding box position and camera position here. We also allow annotator modifying the referring expressions.


In MeshViewer_save7.js, we save the implementation by 10.22. We have implement the interface with 4 steps, adding referring expressions that can be modified. Now we are dealing with dragging arrow & bounding box.


In MeshViewer_save8.js, we save the implementation by 10.23. We have resolve issue: dragging arrow & bounding box.
Now they can be dragged accurately and separately even if they are close to each other. We plan to add datasetname and referring expressions id in the website.


In MeshViewer_save9.js, we save the implementation by 10.25. We have made the website interface almost done. Here are some
suggestions by Xiaojian: 
    Add reset button
    change button Axes and Cylinder to show/hide Axes , show/hide Cylinder
    bounding box size can be changed from a vertice
    click on a object size, the bounding box can manually reshape into that size.(and position?)

In MeshViewer_save10.js, we save the implementation by 11.4. We adopted the suggestions of Xiaojian. 
However, we need to modify the interface to be suitable for the annotators. So we plan to keep modifying MeshViewer.js.
这一个版本基本上是可以开源的英文版本

从这里开始index.js发生了变化，不再需要referring_expressions_id这个params, 在meshviewer里面也不会再有submit这个选项将数据存入数据库中。

In MeshViewer_save11.js, 我们希望可以在javascrpt里面增加一个Load和save按钮，点击load按钮可以从一个div中将标注员之前标注好的内容读取出来并且加载到场景中(如bounding box的大小和位置，相机的参数等);点击save按钮会把标注员标注好的东西存起来到div里，更新对应referring expressions的标注内容
MeshViewer_save11.js还未被修改完毕....

In MeshViewer_save12.js,我们实现了save按钮，点击refer_exp ID就可以从标注员之前标注好的内容读取出来并且加载到场景中;如果标注员没有标过的话，就会恢复成场景加载的默认值, 

In MeshViewer_save13.js，scenegraph和referring expressions融合到一起，以及去掉datasettype，在render_label_list里面使用数据集的名字作为将scenegraph中object大小对应到meshviewer中的ply的大小的依据。
这版的meshviewer可以说是对应给标注公司的英文版本
接下来我们需要把英文界面翻译成中文的界面。

在server/views/MeshViewer.pug里面修改为Anywhere3D

翻译中文：
主要工作
在meshviewer中增加object_name_translation这个字典，通过load_en_zh_obj_name这个函数调用
为this.obj_mesh增加chinese_name属性
在render_label_list函数中传入chinese_name，而不是Obj_name（英文）
在/home/wangtianxu/SQA3D_Viewer/client/js/apps/utils.js里面修改add_instance_label_no_color函数，obj的下拉栏中只显示中文和物体大小；蓝色的总栏显示物体中文名，英文名以及物体数量

保存/home/wangtianxu/SQA3D_Viewer/client/js/apps/MeshViewer/view/RootUI.js到 RootUI_save2.js
在/home/wangtianxu/SQA3D_Viewer/client/js/apps/MeshViewer/view/RootUI.js里面把control bar, List of Objects修改为中文


In MeshViewer_room.js, we implement MeshViewer Version for grounding referring expressions to room levels

In MeshViewer_object.js, we implement MeshViewer Version for grounding referring expressions to object levels

In MeshViewer_part.js, we implement MeshViewer Version for grounding referring expressions to part levels

Now we are working on MeshViewer.js (grounding referring expressions to space level), making ToDos a reality.

